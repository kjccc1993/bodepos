import { InvoiceStatus } from '@prisma/client';
import { AppError } from '../shared/errors.js';
import { prisma } from '../shared/prisma.js';
import { roundUsd, toNumber, usdToBs } from '../shared/money.js';

export type InvoicePaymentPayload = {
  usdCash?: number;
  posBs?: number;
  pos2Bs?: number;
  mobileBs?: number;
  cashBs?: number;
  biopagoBs?: number;
};

export type InvoiceChangePayload = {
  bs?: number;
  usd?: number;
  mobileBs?: number;
};

function normalizePayments(input: InvoicePaymentPayload) {
  return {
    usdCash: input.usdCash ?? 0,
    posBs: input.posBs ?? 0,
    pos2Bs: input.pos2Bs ?? 0,
    mobileBs: input.mobileBs ?? 0,
    cashBs: input.cashBs ?? 0,
    biopagoBs: input.biopagoBs ?? 0,
  };
}

function paidUsdEquivalent(
  pay: ReturnType<typeof normalizePayments>,
  rate: number,
): number {
  return roundUsd(
    pay.usdCash + (pay.posBs + pay.pos2Bs + pay.mobileBs + pay.cashBs + pay.biopagoBs) / rate,
  );
}

export async function applyInvoicePayments(
  storeId: string,
  invoiceId: string,
  input: {
    payments: InvoicePaymentPayload;
    change: InvoiceChangePayload;
    totalUsd?: number;
  },
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, storeId },
    include: { lines: true, customer: true },
  });
  if (!invoice) throw new AppError(404, 'NOT_FOUND', 'Factura no encontrada');

  const rate = toNumber(invoice.rateApplied);
  if (rate <= 0) throw new AppError(422, 'INVALID_RATE', 'Tasa de la factura inválida');

  const linesTotalUsd = roundUsd(
    invoice.lines.reduce((acc, line) => roundUsd(acc + toNumber(line.lineTotalUsd)), 0),
  );

  let totalUsd = toNumber(invoice.totalUsd);
  if (input.totalUsd != null) {
    const requested = roundUsd(input.totalUsd);
    if (requested + 0.0001 < linesTotalUsd) {
      throw new AppError(
        422,
        'TOTAL_TOO_LOW',
        'El total no puede ser menor al de las líneas de la factura',
      );
    }
    totalUsd = requested;
  }

  const oldCredit = roundUsd(toNumber(invoice.creditUsd));
  const pay = normalizePayments(input.payments);
  const paidUsdEq = paidUsdEquivalent(pay, rate);
  const newCredit = roundUsd(Math.max(0, totalUsd - paidUsdEq));

  if (invoice.status === InvoiceStatus.PAID && newCredit > 0.0001) {
    throw new AppError(
      422,
      'UNDERPAID',
      'El monto pagado es menor al total; no se puede dejar fiado en una factura ya pagada',
    );
  }

  const status = newCredit > 0 ? InvoiceStatus.PENDING : InvoiceStatus.PAID;
  const creditDelta = roundUsd(newCredit - oldCredit);

  return prisma.$transaction(async tx => {
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status,
        totalUsd,
        totalBs: usdToBs(totalUsd, rate),
        paidUsdCash: pay.usdCash,
        paidPosBs: pay.posBs,
        paidPos2Bs: pay.pos2Bs,
        paidMobileBs: pay.mobileBs,
        paidCashBs: pay.cashBs,
        paidBiopagoBs: pay.biopagoBs,
        changeUsd: input.change.usd ?? 0,
        changeBs: input.change.bs ?? 0,
        changeMobileBs: input.change.mobileBs ?? 0,
        creditUsd: newCredit,
      },
      include: { lines: true, customer: true },
    });

    if (invoice.customerId && Math.abs(creditDelta) > 0.0001) {
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { debtUsd: { increment: creditDelta } },
      });
    }

    return updated;
  });
}
