import { Router } from 'express';
import { z } from 'zod';
import { ProductUnit } from '@prisma/client';
import { asyncHandler } from '../shared/async-handler.js';
import { AppError } from '../shared/errors.js';
import { prisma } from '../shared/prisma.js';
import { toNumber } from '../shared/money.js';
import { authRequired, requireStore } from '../shared/session.js';
import { adjustInventory, executeCheckout } from './checkout.service.js';
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
  serializeStore,
} from './serialize.js';

export const posRouter = Router();
posRouter.use(authRequired);

async function getStoreRate(storeId: string): Promise<number> {
  return resolveEffectiveRateForStore(storeId);
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
  '/products',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const rate = await getStoreRate(storeId);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const where = {
      storeId,
      isActive: true,
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    };
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const usePagination = Number.isFinite(rawLimit) || Number.isFinite(rawOffset);
    if (!usePagination) {
      const products = await prisma.product.findMany({ where, orderBy: { name: 'asc' } });
      res.json(products.map(p => serializeProduct(p, rate)));
      return;
    }
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 36, 1), 100);
    const offset = Math.max(Number.isFinite(rawOffset) ? rawOffset : 0, 0);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { name: 'asc' }, take: limit, skip: offset }),
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
    });
    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
    res.json(serializeProduct(product, rate));
  }),
);

const productBody = z.object({
  name: z.string().min(1),
  priceUsd: z.number().positive(),
  unit: z.nativeEnum(ProductUnit),
  stock: z.number().optional(),
  barcode: z.string().nullable().optional(),
  lowStockThreshold: z.number().nullable().optional(),
});

posRouter.post(
  '/products',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const parsed = productBody.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Producto inválido');
    const rate = await getStoreRate(storeId);
    const product = await prisma.product.create({
      data: { storeId, ...parsed.data, stock: parsed.data.stock ?? 0 },
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
    const product = await prisma.product.update({ where: { id: existing.id }, data: parsed.data });
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
    const product = await adjustInventory(storeId, parsed.data.productId, parsed.data.qtyDelta, parsed.data.type, parsed.data.note);
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
    const customer = await prisma.customer.create({
      data: {
        storeId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        debtUsd: parsed.data.debtUsd ?? 0,
        colorTag: parsed.data.colorTag,
      },
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
    const rows = await prisma.dailyIncome.findMany({
      where: { storeId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(rows.map(serializeDailyIncome));
  }),
);

posRouter.post(
  '/daily-incomes',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const schema = z.object({
      date: z.string(),
      usdCash: z.number(),
      cashBs: z.number(),
      posBs: z.number(),
      pos2Bs: z.number(),
      mobileBs: z.number(),
      biopagoBs: z.number(),
      totalUsd: z.number(),
      totalBs: z.number(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, 'VALIDATION_ERROR', 'Ingreso inválido');
    const date = new Date(`${parsed.data.date}T12:00:00.000Z`);
    const { date: dateStr, ...amounts } = parsed.data;
    const row = await prisma.dailyIncome.upsert({
      where: { storeId_date: { storeId, date } },
      create: { storeId, date, ...amounts },
      update: { ...amounts },
    });
    res.json(serializeDailyIncome(row));
  }),
);

posRouter.get(
  '/sync/pull',
  asyncHandler(async (req, res) => {
    const { storeId } = requireStore(req);
    const since = req.query.since ? new Date(String(req.query.since)) : new Date(0);
    const rate = await getStoreRate(storeId);
    const [products, customers, store] = await Promise.all([
      prisma.product.findMany({ where: { storeId, updatedAt: { gte: since } } }),
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
