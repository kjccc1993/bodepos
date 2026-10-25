import { apiFetch } from '@/lib/http/client';
import { getCachedProducts } from '@/lib/offline/sync';
import type { Product, ProductsListPage } from '@/lib/types';

export const PRODUCT_PAGE_SIZE = 24;

function filterCachedBySearch(products: Product[], search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return products;
  return products.filter(p => p.name.toLowerCase().includes(q));
}

export async function fetchProductsPage(
  search: string,
  offset: number,
  limit = PRODUCT_PAGE_SIZE,
): Promise<ProductsListPage> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  const q = search.trim();
  if (q) params.set('q', q);

  try {
    return await apiFetch<ProductsListPage>(`/products?${params.toString()}`);
  } catch {
    const all = filterCachedBySearch(await getCachedProducts(), search);
    const items = all.slice(offset, offset + limit);
    return {
      items,
      total: all.length,
      hasMore: offset + items.length < all.length,
    };
  }
}

export async function fetchAllProductsForCache(): Promise<Product[]> {
  const all: Product[] = [];
  let offset = 0;
  while (true) {
    const page = await fetchProductsPage('', offset, 100);
    all.push(...page.items);
    if (!page.hasMore) break;
    offset += page.items.length;
  }
  return all;
}
