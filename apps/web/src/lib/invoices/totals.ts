import type { Invoice, InvoiceSummary } from '@/lib/types';

export type InvoiceTotalsBreakdown = {
  totalUsd: number;
  totalBs: number;
  usdCash: number;
  cashBs: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  biopagoBs: number;
};

export function breakdownFromInvoiceSummary(summary: InvoiceSummary): InvoiceTotalsBreakdown {
  return {
    totalUsd: summary.totalUsd,
    totalBs: summary.totalBs,
    usdCash: summary.usdCash,
    cashBs: summary.cashBs,
    posBs: summary.posBs,
    pos2Bs: summary.pos2Bs,
    mobileBs: summary.mobileBs,
    biopagoBs: summary.biopagoBs,
  };
}

export function breakdownFromInvoice(invoice: Invoice): InvoiceTotalsBreakdown {
  const p = invoice.payments;
  return {
    totalUsd: invoice.totalUsd,
    totalBs: invoice.totalBs,
    usdCash: p.usdCash,
    cashBs: p.cashBs,
    posBs: p.posBs,
    pos2Bs: p.pos2Bs,
    mobileBs: p.mobileBs,
    biopagoBs: p.biopagoBs,
  };
}
