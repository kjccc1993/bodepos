import { Router } from 'express';
import { z } from 'zod';
import { Prisma, ProductUnit } from '@prisma/client';
import { asyncHandler } from '../shared/async-handler.js';
import { AppError } from '../shared/errors.js';
import { prisma } from '../shared/prisma.js';
import { toNumber } from '../shared/money.js';
import { authRequired, requireStore } from '../shared/session.js';
import { adjustInventory, executeCheckout } from './checkout.service.js';
import { createOpeningBalanceInvoice } from './opening-balance-invoice.js';
import { applyInvoicePayments } from './invoice-payment.service.js';
import {
  normalizeStoreRateState,
  refreshBcvRateIfNeeded,
  resolveEffectiveRateForStore,
} from './exchange-rates/service.js';
import {
  serializeCustomer,
  serializeDailyIncome,
  serializeInvoice,
  serializeProduct,
  serializeProductCategory,
  serializeStore,
} from './serialize.js';
import { productWithCategoryArgs } from './product-include.js';

export const posRouter = Router();
posRouter.use(authRequired);

async function getStoreRate(storeId: string): Promise<number> {
  return resolveEffectiveRateForStore(storeId);
}

async function resolveProductCategoryId(
  storeId: string,
  categoryId: string | null | undefined,
): Promise<string | null | undefined> {
  if (categoryId === undefined) return undefined;
  if (categoryId === null) return null;
  const cat = await prisma.productCategory.findFirst({
    where: { id: categoryId, storeId, isActive: true },
  });
  if (!cat) throw new AppError(422, 'VALIDATION_ERROR', 'Categoría inválida');
  return categoryId;
}

posRouter.post(
  '/exchange-rates/refresh',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const force = req.query.force === 'true';
    const result = await refreshBcvRateIfNeeded(storeId, { force });
    const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
    res.json({ ...result, store: serializeStore(store) });
  }),
);

posRouter.get(
  '/store-settings',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const store = await normalizeStoreRateState(storeId);
    res.json(serializeStore(store));
  }),
);

posRouter.patch(
  '/store-settings',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const schema = z.object({
      customRate: z.number().positive().optional(),
      name: z.string().min(1).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Datos inválidos');

    const data: { name?: string; customRate?: number; manualRateSetAt?: Date; useFixedRate?: boolean } = {
      ...parsed.data,
    };
    if (parsed.data.customRate !== undefined) {
      data.manualRateSetAt = new Date();
      data.useFixedRate = false;
    }

    const store = await prisma.store.update({ where: { id: storeId }, data });
    res.json(serializeStore(store));
  }),
);

posRouter.get(
  '/product-categories',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const categories = await prisma.productCategory.findMany({
      where: { storeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const counts = await prisma.product.groupBy({
      by: ['categoryId'],
      where: { storeId, isActive: true, categoryId: { not: null } },
      _count: { _all: true },
    });
    const countById = new Map(counts.map(c => [c.categoryId!, c._count._all]));
    res.json(
      categories.map(c => ({
        ...serializeProductCategory(c)!,
        productCount: countById.get(c.id) ?? 0,
      })),
    );
  }),
);

posRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const rate = await getStoreRate(storeId);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId.trim() : '';
    const where: Prisma.ProductWhereInput = {
      storeId,
      isActive: true,
    };
    if (q) {
      where.name = { contains: q, mode: Prisma.QueryMode.insensitive };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const listArgs = { where, orderBy: { name: 'asc' as const }, ...productWithCategoryArgs };
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const usePagination = Number.isFinite(rawLimit) || Number.isFinite(rawOffset);
    if (!usePagination) {
      const products = await prisma.product.findMany(listArgs);
      res.json(products.map(p => serializeProduct(p, rate)));
      return;
    }
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 36, 1), 100);
    const offset = Math.max(Number.isFinite(rawOffset) ? rawOffset : 0, 0);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ ...listArgs, take: limit, skip: offset }),
      prisma.product.count({ where }),
    ]);
    res.json({
      items: products.map(p => serializeProduct(p, rate)),
      total,
      hasMore: offset + products.length < total,
    });
  }),
);

posRouter.get(
  '/products/by-barcode/:code',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const rate = await getStoreRate(storeId);
    const product = await prisma.product.findFirst({
      where: { storeId, barcode: req.params.code, isActive: true },
      ...productWithCategoryArgs,
    });
    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
    res.json(serializeProduct(product, rate));
  }),
);

const productBody = z.object({
  name: z.string().min(1),
  priceUsd: z.number().positive(),
  costUsd: z.number().min(0).optional(),
  unit: z.nativeEnum(ProductUnit),
  stock: z.number().optional(),
  barcode: z.string().nullable().optional(),
  lowStockThreshold: z.number().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});

posRouter.post(
  '/products',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const parsed = productBody.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Producto inválido');
    const rate = await getStoreRate(storeId);
    const { categoryId: bodyCategoryId, ...rest } = parsed.data;
    const categoryId = await resolveProductCategoryId(storeId, bodyCategoryId);
    const product = await prisma.product.create({
      data: {
        storeId,
        ...rest,
        stock: parsed.data.stock ?? 0,
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
      ...productWithCategoryArgs,
    });
    res.status(201).json(serializeProduct(product, rate));
  }),
);

posRouter.patch(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const parsed = productBody.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Producto inválido');
    const rate = await getStoreRate(storeId);
    const existing = await prisma.product.findFirst({ where: { id: req.params.id, storeId } });
    if (!existing) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
    const { categoryId: bodyCategoryId, ...patchRest } = parsed.data;
    const categoryId = await resolveProductCategoryId(storeId, bodyCategoryId);
    const data = { ...patchRest, ...(categoryId !== undefined ? { categoryId } : {}) };
    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
      ...productWithCategoryArgs,
    });
    res.json(serializeProduct(product, rate));
  }),
);

posRouter.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const existing = await prisma.product.findFirst({ where: { id: req.params.id, storeId } });
    if (!existing) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
    await prisma.product.update({ where: { id: existing.id }, data: { isActive: false } });
    res.status(204).end();
  }),
);

posRouter.post(
  '/inventory/adjust',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const schema = z.object({
      productId: z.string().uuid(),
      qtyDelta: z.number(),
      type: z.enum(['PURCHASE', 'ADJUSTMENT']),
      note: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Ajuste inválido');
    const rate = await getStoreRate(storeId);
    await adjustInventory(storeId, parsed.data.productId, parsed.data.qtyDelta, parsed.data.type, parsed.data.note);
    const product = await prisma.product.findFirstOrThrow({
      where: { id: parsed.data.productId, storeId },
      ...productWithCategoryArgs,
    });
    res.json(serializeProduct(product, rate));
  }),
);

posRouter.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const rate = await getStoreRate(storeId);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const customers = await prisma.customer.findMany({
      where: {
        storeId,
        isActive: true,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json(customers.map(c => serializeCustomer(c, rate)));
  }),
);

posRouter.get(
  '/customers/:id',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const rate = await getStoreRate(storeId);
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, storeId, isActive: true },
      include: {
        invoices: {
          include: { lines: true, customer: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');

    const { invoices, ...rest } = customer;
    const sortedInvoices = [...invoices].sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'PENDING') return -1;
        if (b.status === 'PENDING') return 1;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    res.json({
      ...serializeCustomer(rest, rate),
      invoices: sortedInvoices.map(inv => serializeInvoice(inv, rate)),
    });
  }),
);

posRouter.post(
  '/customers',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const schema = z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      debtUsd: z.number().optional(),
      colorTag: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Cliente inválido');
    const rate = await getStoreRate(storeId);
    const initialDebtUsd = parsed.data.debtUsd ?? 0;
    const customer = await prisma.$transaction(async tx => {
      const created = await tx.customer.create({
        data: {
          storeId,
          name: parsed.data.name,
          phone: parsed.data.phone,
          debtUsd: initialDebtUsd,
          colorTag: parsed.data.colorTag,
        },
      });
      if (initialDebtUsd > 0) {
        await createOpeningBalanceInvoice(tx, {
          storeId,
          customerId: created.id,
          debtUsd: initialDebtUsd,
          rateApplied: rate,
        });
      }
      return created;
    });
    res.status(201).json(serializeCustomer(customer, rate));
  }),
);

posRouter.post(
  '/customers/:id/payments',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const schema = z.object({
      amountUsd: z.number().positive(),
      method: z.string().min(1),
      note: z.string().optional(),
      clientOpId: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Abono inválido');

    if (parsed.data.clientOpId) {
      const dup = await prisma.customerPayment.findFirst({
        where: { storeId, clientOpId: parsed.data.clientOpId },
      });
      if (dup) {
        const rate = await getStoreRate(storeId);
        const customer = await prisma.customer.findUniqueOrThrow({ where: { id: dup.customerId } });
        res.json(serializeCustomer(customer, rate));
        return;
      }
    }

    const customer = await prisma.customer.findFirst({ where: { id: req.params.id, storeId } });
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');

    const updated = await prisma.$transaction(async tx => {
      const c = await tx.customer.update({
        where: { id: customer.id },
        data: { debtUsd: { decrement: parsed.data!.amountUsd } },
      });
      await tx.customerPayment.create({
        data: {
          storeId,
          customerId: customer.id,
          amountUsd: parsed.data!.amountUsd,
          method: parsed.data!.method,
          note: parsed.data!.note,
          clientOpId: parsed.data!.clientOpId ?? null,
        },
      });
      return c;
    });

    const rate = await getStoreRate(storeId);
    res.json(serializeCustomer(updated, rate));
  }),
);

const checkoutSchema = z.object({
  clientOpId: z.string().optional(),
  customerId: z.string().uuid().nullable().optional(),
  isCredit: z.boolean(),
  rateApplied: z.number().positive(),
  lines: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().positive() })),
  payments: z.object({
    usdCash: z.number().optional(),
    posBs: z.number().optional(),
    pos2Bs: z.number().optional(),
    mobileBs: z.number().optional(),
    cashBs: z.number().optional(),
    biopagoBs: z.number().optional(),
  }),
  change: z.object({
    bs: z.number().optional(),
    usd: z.number().optional(),
    mobileBs: z.number().optional(),
  }),
  totalUsd: z.number().positive().optional(),
});

posRouter.post(
  '/sales/checkout',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Checkout inválido');
    const invoice = await executeCheckout({ storeId, ...parsed.data });
    const rate = toNumber(invoice.rateApplied);
    res.status(201).json(serializeInvoice(invoice, rate));
  }),
);

function dayRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDateOnly(value: unknown, label: string): Date {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) {
    throw new AppError(422, 'VALIDATION_ERROR', `${label} inválida`);
  }
  return new Date(`${value}T12:00:00.000Z`);
}

function dailyIncomeDateWhere(fromRaw: unknown, toRaw: unknown): Prisma.DailyIncomeWhereInput['date'] | undefined {
  const parts: Prisma.DateTimeFilter = {};
  if (fromRaw !== undefined && fromRaw !== '') {
    parts.gte = parseIsoDateOnly(fromRaw, 'Fecha desde');
  }
  if (toRaw !== undefined && toRaw !== '') {
    parts.lte = parseIsoDateOnly(toRaw, 'Fecha hasta');
  }
  return Object.keys(parts).length > 0 ? parts : undefined;
}

posRouter.get(
  '/invoices/summary',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const { start, end } = dayRange(dateStr);
    const invoices = await prisma.invoice.findMany({
      where: { storeId, createdAt: { gte: start, lte: end } },
    });
    const summary = invoices.reduce(
      (acc, inv) => {
        acc.count += 1;
        acc.totalUsd += toNumber(inv.totalUsd);
        acc.totalBs += toNumber(inv.totalBs);
        acc.usdCash += toNumber(inv.paidUsdCash);
        acc.cashBs += toNumber(inv.paidCashBs);
        acc.posBs += toNumber(inv.paidPosBs);
        acc.pos2Bs += toNumber(inv.paidPos2Bs);
        acc.mobileBs += toNumber(inv.paidMobileBs);
        acc.biopagoBs += toNumber(inv.paidBiopagoBs);
        return acc;
      },
      { count: 0, totalUsd: 0, totalBs: 0, usdCash: 0, cashBs: 0, posBs: 0, pos2Bs: 0, mobileBs: 0, biopagoBs: 0 },
    );
    res.json({ date: dateStr, ...summary });
  }),
);

posRouter.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const rate = await getStoreRate(storeId);
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const { start, end } = dayRange(dateStr);
    const invoices = await prisma.invoice.findMany({
      where: { storeId, createdAt: { gte: start, lte: end } },
      include: { lines: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices.map(i => serializeInvoice(i, rate)));
  }),
);

const invoicePaymentsSchema = z.object({
  totalUsd: z.number().positive().optional(),
  payments: z.object({
    usdCash: z.number().optional(),
    posBs: z.number().optional(),
    pos2Bs: z.number().optional(),
    mobileBs: z.number().optional(),
    cashBs: z.number().optional(),
    biopagoBs: z.number().optional(),
  }),
  change: z
    .object({
      bs: z.number().optional(),
      usd: z.number().optional(),
      mobileBs: z.number().optional(),
    })
    .optional()
    .default({}),
});

posRouter.patch(
  '/invoices/:id/payments',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const parsed = invoicePaymentsSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Pago inválido');
    const invoice = await applyInvoicePayments(storeId, req.params.id, parsed.data);
    const rate = toNumber(invoice.rateApplied);
    res.json(serializeInvoice(invoice, rate));
  }),
);

posRouter.delete(
  '/invoices/:id',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, storeId },
      include: { lines: true },
    });
    if (!invoice) throw new AppError(404, 'NOT_FOUND', 'Factura no encontrada');

    await prisma.$transaction(async tx => {
      for (const line of invoice.lines) {
        if (line.productId) {
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { increment: toNumber(line.quantity) } },
          });
        }
      }
      if (toNumber(invoice.creditUsd) > 0 && invoice.customerId) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: { debtUsd: { decrement: toNumber(invoice.creditUsd) } },
        });
      }
      await tx.invoiceLine.deleteMany({ where: { invoiceId: invoice.id } });
      await tx.invoice.delete({ where: { id: invoice.id } });
    });
    res.status(204).end();
  }),
);

posRouter.get(
  '/daily-incomes/prefill',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const { start, end } = dayRange(dateStr);
    const invoices = await prisma.invoice.findMany({
      where: { storeId, createdAt: { gte: start, lte: end } },
    });
    const prefill = invoices.reduce(
      (acc, inv) => {
        acc.usdCash += toNumber(inv.paidUsdCash);
        acc.cashBs += toNumber(inv.paidCashBs);
        acc.posBs += toNumber(inv.paidPosBs);
        acc.pos2Bs += toNumber(inv.paidPos2Bs);
        acc.mobileBs += toNumber(inv.paidMobileBs);
        acc.biopagoBs += toNumber(inv.paidBiopagoBs);
        acc.totalUsd += toNumber(inv.totalUsd);
        acc.totalBs += toNumber(inv.totalBs);
        return acc;
      },
      { usdCash: 0, cashBs: 0, posBs: 0, pos2Bs: 0, mobileBs: 0, biopagoBs: 0, totalUsd: 0, totalBs: 0 },
    );
    res.json({ date: dateStr, ...prefill });
  }),
);

posRouter.get(
  '/daily-incomes',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const dateFilter = dailyIncomeDateWhere(req.query.from, req.query.to);
    const where: Prisma.DailyIncomeWhereInput = { storeId, ...(dateFilter ? { date: dateFilter } : {}) };
    const listArgs = { where, orderBy: { date: 'desc' as const } };
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const usePagination = Number.isFinite(rawLimit) || Number.isFinite(rawOffset);
    if (!usePagination) {
      const rows = await prisma.dailyIncome.findMany(listArgs);
      res.json(rows.map(serializeDailyIncome));
      return;
    }
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 36, 1), 100);
    const offset = Math.max(Number.isFinite(rawOffset) ? rawOffset : 0, 0);
    const [rows, total] = await Promise.all([
      prisma.dailyIncome.findMany({ ...listArgs, take: limit, skip: offset }),
      prisma.dailyIncome.count({ where }),
    ]);
    res.json({
      items: rows.map(serializeDailyIncome),
      total,
      hasMore: offset + rows.length < total,
    });
  }),
);

const dailyIncomeAmountsSchema = z.object({
  usdCash: z.number(),
  cashBs: z.number(),
  posBs: z.number(),
  pos2Bs: z.number(),
  mobileBs: z.number(),
  biopagoBs: z.number(),
  totalUsd: z.number(),
  totalBs: z.number(),
});

const dailyIncomeCreateSchema = dailyIncomeAmountsSchema.extend({
  date: z.string(),
});

posRouter.post(
  '/daily-incomes',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const parsed = dailyIncomeCreateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Ingreso inválido');
    const date = parseIsoDateOnly(parsed.data.date, 'Fecha');
    const { date: _dateStr, ...amounts } = parsed.data;
    const existing = await prisma.dailyIncome.findUnique({
      where: { storeId_date: { storeId, date } },
    });
    if (existing) {
      throw new AppError(409, 'DAILY_INCOME_EXISTS', 'Ya existe un ingreso registrado para esta fecha');
    }
    const row = await prisma.dailyIncome.create({ data: { storeId, date, ...amounts } });
    res.status(201).json(serializeDailyIncome(row));
  }),
);

posRouter.put(
  '/daily-incomes/:date',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const date = parseIsoDateOnly(req.params.date, 'Fecha');
    const parsed = dailyIncomeAmountsSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Ingreso inválido');
    try {
      const row = await prisma.dailyIncome.update({
        where: { storeId_date: { storeId, date } },
        data: parsed.data,
      });
      res.json(serializeDailyIncome(row));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new AppError(404, 'NOT_FOUND', 'Ingreso no encontrado');
      }
      throw e;
    }
  }),
);

posRouter.delete(
  '/daily-incomes/:date',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const date = parseIsoDateOnly(req.params.date, 'Fecha');
    try {
      await prisma.dailyIncome.delete({ where: { storeId_date: { storeId, date } } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new AppError(404, 'NOT_FOUND', 'Ingreso no encontrado');
      }
      throw e;
    }
    res.status(204).end();
  }),
);

posRouter.get(
  '/sync/pull',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const since = req.query.since ? new Date(String(req.query.since)) : new Date(0);
    const rate = await getStoreRate(storeId);
    const [products, customers, store] = await Promise.all([
      prisma.product.findMany({
        where: { storeId, updatedAt: { gte: since } },
        ...productWithCategoryArgs,
      }),
      prisma.customer.findMany({ where: { storeId, createdAt: { gte: since } } }),
      prisma.store.findUniqueOrThrow({ where: { id: storeId } }),
    ]);
    res.json({
      serverTime: new Date().toISOString(),
      store: serializeStore(store),
      products: products.map(p => serializeProduct(p, rate)),
      customers: customers.map(c => serializeCustomer(c, rate)),
    });
  }),
);

posRouter.post(
  '/sync/push',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const schema = z.object({
      operations: z.array(
        z.object({
          kind: z.enum(['checkout', 'customer_payment']),
          clientOpId: z.string(),
          payload: z.record(z.unknown()),
        }),
      ),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Sync inválido');
    const results: unknown[] = [];
    for (const op of parsed.data.operations) {
      if (op.kind === 'checkout') {
        const body = checkoutSchema.parse(op.payload);
        const invoice = await executeCheckout({ storeId, clientOpId: op.clientOpId, ...body });
        results.push({ clientOpId: op.clientOpId, invoiceId: invoice.id });
      }
    }
    res.json({ ok: true, results });
  }),
);
