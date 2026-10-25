import { sanitizeDecimalInput } from '@/lib/utils/numeric-input';

/** Montos en USD o Bs en UI y payloads: siempre 2 decimales. */
export function roundUsd(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export const roundBs = roundUsd;

export function parseMoneyAmount(raw: string): number {
  const cleaned = sanitizeDecimalInput(raw);
  const normalized = cleaned.replace(',', '.');
  if (normalized === '' || normalized === '.' || normalized === ',') return 0;

  const [intPart = '', decPart = ''] = normalized.split('.');
  const limited = decPart.length > 0 ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
  const n = Number(limited);
  if (!Number.isFinite(n) || n < 0) return 0;
  return roundUsd(n);
}

/** Valor para inputs de monto (coma decimal, 2 decimales). */
export function formatMoneyInput(n: number): string {
  if (!n) return '';
  return roundUsd(n).toFixed(2).replace('.', ',');
}

/** Al enfocar un input de monto (sin forzar ,00 mientras se escribe). */
export function formatMoneyDraft(n: number): string {
  if (!n) return '';
  return String(roundUsd(n)).replace('.', ',');
}

export function formatUsd(n: number) {
  const r = roundUsd(n);
  const abs = Math.abs(r).toFixed(2).replace('.', ',');
  return r < 0 ? `-$${abs}` : `$${abs}`;
}

export function formatBs(n: number) {
  const r = roundUsd(n);
  const abs = Math.abs(r).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return r < 0 ? `-Bs ${abs}` : `Bs ${abs}`;
}

export function usdToBs(usd: number, rate: number) {
  return roundBs(roundUsd(usd) * rate);
}
