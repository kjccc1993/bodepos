import { type QueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchProductsPage, PRODUCT_PAGE_SIZE } from '@/lib/api/products-page';
import type { ProductsListPage } from '@/lib/types';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const STALE_MS = 2 * 60_000;

function getNextOffsetFromPages(allPages: ProductsListPage[]) {
  const last = allPages[allPages.length - 1];
  if (!last?.hasMore) return undefined;
  return allPages.reduce((acc, page) => acc + page.items.length, 0);
}

export function prefetchDefaultProductLists(qc: QueryClient) {
  void qc.prefetchInfiniteQuery({
    queryKey: ['products-infinite', ''],
    queryFn: ({ pageParam }) => fetchProductsPage('', pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage: ProductsListPage, allPages: ProductsListPage[]) => {
      if (!lastPage.hasMore) return undefined;
      return getNextOffsetFromPages(allPages);
    },
    staleTime: STALE_MS,
  });
}

export function useInfiniteProductList(search: string) {
  const debouncedSearch = useDebouncedValue(search);

  const query = useInfiniteQuery({
    queryKey: ['products-infinite', debouncedSearch],
    queryFn: ({ pageParam }) => fetchProductsPage(debouncedSearch, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return getNextOffsetFromPages(allPages);
    },
    staleTime: STALE_MS,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const products = useMemo(
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
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage, products.length]);

  return {
    products,
    debouncedSearch,
    sentinelRef,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export { PRODUCT_PAGE_SIZE };
