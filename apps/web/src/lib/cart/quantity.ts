import type { CartLine, ProductUnit } from '@/lib/types';

/** Precio en catálogo: por unidad o por kilogramo (GRAM/KG). */
export function toBillingQuantity(quantity: number, unit: ProductUnit): number {
  if (unit === 'GRAM') return quantity / 1000;
  return quantity;
}

export function lineTotalUsd(line: Pick<CartLine, 'unitPriceUsd' | 'quantity' | 'unit'>): number {
  return Math.round(line.unitPriceUsd * toBillingQuantity(line.quantity, line.unit) * 10000) / 10000;
}

export function quantityFieldLabel(unit: ProductUnit): string {
  if (unit === 'UNIT') return 'Cant.';
  if (unit === 'GRAM') return 'Gramos';
  return 'Kg';
}

export function quantityUnitHint(unit: ProductUnit): string {
  if (unit === 'UNIT') return 'Unidad(es)';
  if (unit === 'GRAM') return 'Gramos';
  return 'Kilogramos';
}

/** Etiqueta corta encima del stepper en Vender. */
export function quantityStepperLabel(unit: ProductUnit): string {
  if (unit === 'UNIT') return 'Unidades';
  if (unit === 'GRAM') return 'Gramos';
  return 'Kilos';
}

export function quantityPlaceholder(_unit: ProductUnit): string {
  return '0';
}

export function parseQuantityInput(raw: string, unit: ProductUnit): number {
  const normalized = raw.replace(',', '.').trim();
  if (normalized === '') return 0;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (unit === 'UNIT') return Math.floor(n);
  return n;
}
