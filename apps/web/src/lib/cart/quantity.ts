import { roundUsd } from '@/lib/money';
import type { CartLine, ProductUnit } from '@/lib/types';

/** Cada toque de +/− en productos por peso suma o resta 100 g. */
export const GRAM_QUANTITY_STEP = 100;

/**
 * Cantidad de venta: unidades, o gramos.
 * El precio de catálogo de un producto KG sigue siendo por kilogramo.
 */
export function toBillingQuantity(quantity: number, unit: ProductUnit): number {
  if (unit === 'KG') return quantity / 1000;
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

export function formatStockAmount(stock: number, unit: ProductUnit): string {
  if (unit === 'UNIT') {
    return Number.isInteger(stock) ? String(stock) : String(Math.round(stock * 100) / 100);
  }
  return String(Math.round(stock * 1000) / 1000);
}

export function nextSteppedQuantity(current: number, unit: ProductUnit, delta: number): number {
  if (unit === 'UNIT') return Math.max(0, current + delta);
  return Math.max(0, current + delta * GRAM_QUANTITY_STEP);
}

/** Cantidad escrita en Vender: unidades enteras o gramos enteros. */
export function parseQuantityInput(raw: string, unit: ProductUnit): number {
  const normalized = raw.replace(',', '.').trim();
  if (normalized === '') return 0;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (unit === 'UNIT') return Math.floor(n);
  return Math.round(n);
}

/** Ajuste de inventario: unidades enteras o kilogramos (stock del producto). */
export function parseStockQuantity(raw: string, unit: ProductUnit): number {
  const normalized = raw.replace(',', '.').trim();
  if (normalized === '') return 0;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (unit === 'UNIT') return Math.floor(n);
  return Math.round(n * 1000) / 1000;
}
