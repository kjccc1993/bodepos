import { roundUsd } from '@/lib/money';
import type { CartLine, ProductUnit } from '@/lib/types';

/** Precio en catálogo: por unidad (UNIT) o por kg con cantidad en gramos (GRAM). */
export function toBillingQuantity(quantity: number, unit: ProductUnit): number {
  if (unit === 'GRAM') return quantity / 1000;
  return quantity;
}

export function lineTotalUsd(line: Pick<CartLine, 'unitPriceUsd' | 'quantity' | 'unit'>): number {
  return roundUsd(line.unitPriceUsd * toBillingQuantity(line.quantity, line.unit));
}

export function quantityFieldLabel(unit: ProductUnit): string {
  return unit === 'UNIT' ? 'Cant.' : 'Gramos';
}

export function quantityUnitHint(unit: ProductUnit): string {
  return unit === 'UNIT' ? 'Unidad(es)' : 'Gramos';
}

/** Etiqueta corta encima del stepper en Vender. */
export function quantityStepperLabel(unit: ProductUnit): string {
  return unit === 'UNIT' ? 'Unidades' : 'Gramos';
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
