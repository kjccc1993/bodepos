import type { InvoiceLine, ProductUnit } from '@/lib/types';

export function formatInvoiceLineQuantity(quantity: number, unit: ProductUnit): string {
  if (unit === 'KG') {
    const grams = Math.round(quantity * 1000);
    return `${grams} g`;
  }
  return Number.isInteger(quantity) ? String(quantity) : String(Math.round(quantity * 100) / 100);
}

export function invoiceLineTotalBs(line: InvoiceLine, rateApplied: number): number {
  return Math.round(line.lineTotalUsd * rateApplied * 100) / 100;
}
