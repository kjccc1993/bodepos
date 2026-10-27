import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import {
  DAILY_INCOME_PAGE_SIZE,
  fetchDailyIncomesPage,
  type DailyIncomeListRange,
} from '@/lib/api/daily-incomes-page';
import type { DailyIncomesListPage } from '@/lib/types';

const STALE_MS = 2 * 60_000;

function getNextOffsetFromPages(allPages: DailyIncomesListPage[]) {
  const last = allPages[allPages.length - 1];
  if (!last?.hasMore) return undefined;
  return allPages.reduce((acc, page) => acc + page.items.length, 0);
}

export function useInfiniteDailyIncomeList(range: DailyIncomeListRange) {
  const query = useInfiniteQuery({
    queryKey: ['daily-incomes-infinite', range.from, range.to],
    queryFn: ({ pageParam }) => fetchDailyIncomesPage(pageParam, DAILY_INCOME_PAGE_SIZE, range),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return getNextOffsetFromPages(allPages);
    },
    staleTime: STALE_MS,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const incomes = useMemo(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data],
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const root = target.closest('[data-product-scroll-root]') as Element | null;

    const observer = new IntersectionObserver(
      entries => {
        const hit = entries.some(e => e.isIntersecting);
        if (hit && query.hasNextPage && !query.isFetchingNextPage) {
          void query.fetchNextPage();
        }
      },
      { root, rootMargin: '240px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage, incomes.length]);

  return {
    incomes,
    sentinelRef,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export { DAILY_INCOME_PAGE_SIZE };
