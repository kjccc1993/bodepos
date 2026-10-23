import type { StoreSettings } from '@/lib/types';

export function effectiveRate(settings: StoreSettings | undefined): number {
  if (!settings) return 884.75;
  return settings.effectiveRate ?? settings.customRate;
}

/** Convierte texto del input (`.` o `,`) a número de tasa. */
export function parseRateInput(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function formatRateInput(value: number): string {
  return String(value);
}
