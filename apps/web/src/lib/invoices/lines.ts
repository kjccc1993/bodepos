import type { InvoiceLine, ProductUnit } from '@/lib/types';

export function formatInvoiceLineQuantity(quantity: number, unit: ProductUnit): string {
  if (unit === 'GRAM') {
    const n = Number.isInteger(quantity) ? quantity : Math.round(quantity * 10) / 10;
    return `${n}g`;
  }
  return Number.isInteger(quantity) ? String(quantity) : String(Math.round(quantity * 100) / 100);
}

export function invoiceLineTotalBs(line: InvoiceLine, rateApplied: number): number {
  return Math.round(line.lineTotalUsd * rateApplied * 100) / 100;
}
