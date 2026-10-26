import { apiFetch } from '@/lib/http/client';
import { getCachedProducts } from '@/lib/offline/sync';
import type { Product, ProductsListPage } from '@/lib/types';

export const PRODUCT_PAGE_SIZE = 24;

function filterCachedProducts(products: Product[], search: string, categoryId: string) {
  let list = products;
  if (categoryId) list = list.filter(p => p.categoryId === categoryId);
  const q = search.trim().toLowerCase();
  if (!q) return list;
  return list.filter(p => p.name.toLowerCase().includes(q));
}

export async function fetchProductsPage(
  search: string,
  offset: number,
  limit = PRODUCT_PAGE_SIZE,
  categoryId = '',
): Promise<ProductsListPage> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  const q = search.trim();
  if (q) params.set('q', q);
  if (categoryId) params.set('categoryId', categoryId);

  try {
    return await apiFetch<ProductsListPage>(`/products?${params.toString()}`);
  } catch {
    const all = filterCachedProducts(await getCachedProducts(), search, categoryId);
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
