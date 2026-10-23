import { Decimal } from '@prisma/client/runtime/library';

export function d(value: number | string | Decimal): Decimal {
  return new Decimal(value);
}

export function toNumber(value: Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export function roundUsd(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function roundBs(n: number): number {
  return Math.round(n * 100) / 100;
}

export function usdToBs(usd: number, rate: number): number {
  return roundBs(usd * rate);
}
