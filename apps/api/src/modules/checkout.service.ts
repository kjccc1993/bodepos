import { InvoiceStatus, ProductUnit, type Prisma } from '@prisma/client';
import { AppError } from '../shared/errors.js';
import { prisma } from '../shared/prisma.js';
import { roundBs, roundUsd, toNumber, usdToBs } from '../shared/money.js';

export type CheckoutLine = { productId: string; quantity: number };
export type CheckoutPayments = {
  usdCash?: number;
  posBs?: number;
  pos2Bs?: number;
  mobileBs?: number;
  cashBs?: number;
  biopagoBs?: number;
};
export type CheckoutChange = { bs?: number; usd?: number; mobileBs?: number };

/** Precio catálogo en USD por kg (GRAM, cantidad en g) o por unidad (UNIT). */
function billableQuantity(quantity: number, unit: ProductUnit): number {
  if (unit === ProductUnit.GRAM) return quantity / 1000;
  return quantity;
}

export type CheckoutInput = {
  storeId: string;
  clientOpId?: string;
  customerId?: string | null;
  isCredit: boolean;
  rateApplied: number;
  lines: CheckoutLine[];
  payments: CheckoutPayments;
  change: CheckoutChange;
  /** Total a cobrar; no puede ser menor que la suma de líneas. */
  totalUsd?: number;
};

export async function executeCheckout(input: CheckoutInput) {
  if (input.lines.length === 0) {
    throw new AppError(422, 'EMPTY_CART', 'Carrito vacío');
  }

  if (input.clientOpId) {
    const existing = await prisma.invoice.findFirst({
      where: { storeId: input.storeId, clientOpId: input.clientOpId },
      include: { lines: true, customer: true },
    });
    if (existing) return existing;
  }

  const store = await prisma.store.findUniqueOrThrow({ where: { id: input.storeId } });
  const rate = input.rateApplied > 0 ? input.rateApplied : toNumber(store.customRate);

  const productIds = input.lines.map(l => l.productId);
  const products = await prisma.product.findMany({
    where: { storeId: input.storeId, id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  let linesTotalUsd = 0;
  const lineData: Prisma.InvoiceLineCreateWithoutInvoiceInput[] = [];

  for (const line of input.lines) {
    const product = productMap.get(line.productId);
    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', `Producto no encontrado: ${line.productId}`);
    if (line.quantity <= 0) throw new AppError(422, 'INVALID_QTY', 'Cantidad inválida');
    const unitPrice = toNumber(product.priceUsd);
    const lineTotal = roundUsd(unitPrice * billableQuantity(line.quantity, product.unit));
    linesTotalUsd = roundUsd(linesTotalUsd + lineTotal);
    lineData.push({
      product: { connect: { id: product.id } },
      productName: product.name,
      quantity: line.quantity,
      unit: product.unit,
      unitPriceUsd: unitPrice,
      lineTotalUsd: lineTotal,
    });
  }

  let totalUsd = linesTotalUsd;
  if (input.totalUsd != null) {
    const requested = roundUsd(input.totalUsd);
    if (requested + 0.0001 < linesTotalUsd) {
      throw new AppError(422, 'TOTAL_TOO_LOW', 'El total no puede ser menor al del carrito');
    }
    totalUsd = requested;
  }

  const totalBs = usdToBs(totalUsd, rate);

  const pay = {
    usdCash: input.payments.usdCash ?? 0,
    posBs: input.payments.posBs ?? 0,
    pos2Bs: input.payments.pos2Bs ?? 0,
    mobileBs: input.payments.mobileBs ?? 0,
    cashBs: input.payments.cashBs ?? 0,
    biopagoBs: input.payments.biopagoBs ?? 0,
  };

  const paidUsdEquivalent = roundUsd(
    pay.usdCash + (pay.posBs + pay.pos2Bs + pay.mobileBs + pay.cashBs + pay.biopagoBs) / rate,
  );

  let creditUsd = 0;
  if (input.isCredit) {
    if (!input.customerId) throw new AppError(422, 'CUSTOMER_REQUIRED', 'Cliente requerido');
    creditUsd = roundUsd(Math.max(0, totalUsd - paidUsdEquivalent));
  } else if (paidUsdEquivalent + 0.0001 < totalUsd) {
    throw new AppError(422, 'UNDERPAID', 'El monto pagado es menor al total de la factura');
  }

  const status: InvoiceStatus = creditUsd > 0 ? InvoiceStatus.PENDING : InvoiceStatus.PAID;

  const result = await prisma.$transaction(async tx => {
    const updatedStore = await tx.store.update({
      where: { id: input.storeId },
      data: { invoiceSeq: { increment: 1 } },
    });
    const invoiceNumber = updatedStore.invoiceSeq;

    const invoice = await tx.invoice.create({
      data: {
        storeId: input.storeId,
        number: invoiceNumber,
        status,
        customerId: input.customerId ?? null,
        rateApplied: rate,
        totalUsd,
        totalBs,
        paidUsdCash: pay.usdCash,
        paidPosBs: pay.posBs,
        paidPos2Bs: pay.pos2Bs,
        paidMobileBs: pay.mobileBs,
        paidCashBs: pay.cashBs,
        paidBiopagoBs: pay.biopagoBs,
        changeUsd: input.change.usd ?? 0,
        changeBs: input.change.bs ?? 0,
        changeMobileBs: input.change.mobileBs ?? 0,
        creditUsd,
        clientOpId: input.clientOpId ?? null,
        lines: { create: lineData },
      },
      include: { lines: true, customer: true },
    });

    for (const line of input.lines) {
      const product = productMap.get(line.productId)!;
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: line.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          storeId: input.storeId,
          productId: product.id,
          type: 'SALE',
          qtyDelta: -line.quantity,
          note: `Factura ${invoiceNumber.toString()}`,
        },
      });
    }

    if (creditUsd > 0 && input.customerId) {
      await tx.customer.update({
        where: { id: input.customerId },
        data: { debtUsd: { increment: creditUsd } },
      });
    }

    if (input.clientOpId) {
      await tx.syncOperation.create({
        data: {
          storeId: input.storeId,
          clientOpId: input.clientOpId,
          kind: 'checkout',
          payload: input as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return invoice;
  });

  return result;
}

export async function adjustInventory(
  storeId: string,
  productId: string,
  qtyDelta: number,
  type: 'PURCHASE' | 'ADJUSTMENT',
  note?: string,
) {
  if (qtyDelta === 0) throw new AppError(422, 'INVALID_QTY', 'Cantidad inválida');
  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');

  const updated = await prisma.$transaction(async tx => {
    const p = await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: qtyDelta } },
    });
    await tx.inventoryMovement.create({
      data: { storeId, productId, type, qtyDelta, note: note ?? null },
    });
    return p;
  });
  return updated;
}
