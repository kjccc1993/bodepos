import { apiFetch } from '@/lib/http/client';
import type { DailyIncomesListPage } from '@/lib/types';

export const DAILY_INCOME_PAGE_SIZE = 24;

export type DailyIncomeListRange = {
  from: string;
  to: string;
};

export async function fetchDailyIncomesPage(
  offset: number,
  limit = DAILY_INCOME_PAGE_SIZE,
  range?: DailyIncomeListRange,
): Promise<DailyIncomesListPage> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  return apiFetch<DailyIncomesListPage>(`/daily-incomes?${params.toString()}`);
}
