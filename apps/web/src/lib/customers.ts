import { formatUsd } from '@/lib/money';
import type { Customer } from '@/lib/types';

export function customerSelectLabel(c: Pick<Customer, 'name' | 'debtUsd'>): string {
  return `${c.name} (${formatUsd(c.debtUsd)})`;
}
