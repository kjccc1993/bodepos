import { InvoiceStatus, ProductUnit, type Prisma } from '@prisma/client';
import { roundUsd, usdToBs } from '../shared/money.js';

export const OPENING_BALANCE_LINE_NAME = 'Saldo inicial';

export function openingBalanceClientOpId(customerId: string): string {
  return `opening-balance:${customerId}`;
}

/** Factura PENDING por deuda inicial; no modifica debtUsd (ya está en el cliente). */
export async function createOpeningBalanceInvoice(
  tx: Prisma.TransactionClient,
  input: { storeId: string; customerId: string; debtUsd: number; rateApplied: number },
) {
  const debtUsd = roundUsd(input.debtUsd);
  if (debtUsd <= 0) return null;

  const clientOpId = openingBalanceClientOpId(input.customerId);
  const existing = await tx.invoice.findFirst({
    where: { storeId: input.storeId, clientOpId },
  });
  if (existing) return existing;

  const updatedStore = await tx.store.update({
    where: { id: input.storeId },
    data: { invoiceSeq: { increment: 1 } },
  });
  const invoiceNumber = updatedStore.invoiceSeq;
  const totalBs = usdToBs(debtUsd, input.rateApplied);

  return tx.invoice.create({
    data: {
      storeId: input.storeId,
      number: invoiceNumber,
      status: InvoiceStatus.PENDING,
      customerId: input.customerId,
      rateApplied: input.rateApplied,
      totalUsd: debtUsd,
      totalBs,
      creditUsd: debtUsd,
      clientOpId,
      lines: {
        create: {
          productName: OPENING_BALANCE_LINE_NAME,
          quantity: 1,
          unit: ProductUnit.UNIT,
          unitPriceUsd: debtUsd,
          lineTotalUsd: debtUsd,
        },
      },
    },
  });
}
