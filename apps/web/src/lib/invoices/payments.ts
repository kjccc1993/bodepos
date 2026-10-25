import { formatBs, formatUsd, roundUsd } from '@/lib/money';
import type { InvoicePayments } from '@/lib/types';

export function invoicePosBsPaid(payments: InvoicePayments): number {
  return roundUsd(payments.posBs + payments.pos2Bs);
}

export function invoiceBsPaidTotal(payments: InvoicePayments): number {
  return roundUsd(
    payments.cashBs + payments.posBs + payments.pos2Bs + payments.mobileBs + payments.biopagoBs,
  );
}

export type InvoicePaymentRow = { id: string; label: string; value: string };

function hasPaid(n: number) {
  return roundUsd(n) > 0;
}

/** Medios de cobro con monto &gt; 0 (POS 1 y 2 por separado si aplica). */
export function invoiceUsedPaymentRows(payments: InvoicePayments): InvoicePaymentRow[] {
  const rows: InvoicePaymentRow[] = [];
  if (hasPaid(payments.usdCash)) {
    rows.push({ id: 'usd', label: 'Divisas', value: formatUsd(payments.usdCash) });
  }
  if (hasPaid(payments.cashBs)) {
    rows.push({ id: 'cashBs', label: 'Efectivo Bs', value: formatBs(payments.cashBs) });
  }
  if (hasPaid(payments.posBs)) {
    rows.push({ id: 'pos', label: 'POS', value: formatBs(payments.posBs) });
  }
  if (hasPaid(payments.pos2Bs)) {
    rows.push({ id: 'pos2', label: 'POS 2', value: formatBs(payments.pos2Bs) });
  }
  if (hasPaid(payments.mobileBs)) {
    rows.push({ id: 'mobile', label: 'Pago móvil', value: formatBs(payments.mobileBs) });
  }
  if (hasPaid(payments.biopagoBs)) {
    rows.push({ id: 'biopago', label: 'Biopago', value: formatBs(payments.biopagoBs) });
  }
  return rows;
}
