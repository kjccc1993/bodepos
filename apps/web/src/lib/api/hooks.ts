import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/http/client';
import type {
  Customer,
  CustomerDetail,
  ExchangeRateRefreshResult,
  Invoice,
  InvoiceSummary,
  Product,
  StoreSettings,
} from '@/lib/types';
import { fetchAllProductsForCache } from '@/lib/api/products-page';
import { cacheCatalog, flushOutbox, getCachedProducts, pullSync } from '@/lib/offline/sync';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: () => apiFetch<StoreSettings>('/store-settings'),
  });
}

/** Sincroniza la tasa BCV cada hora (el override manual solo aplica el mismo día). */
export function useBcvRateSync() {
  const qc = useQueryClient();
  const { data: settings } = useStoreSettings();

  return useQuery({
    queryKey: ['exchange-rate-refresh'],
    queryFn: async () => {
      const result = await apiFetch<ExchangeRateRefreshResult>('/exchange-rates/refresh', {
        method: 'POST',
      });
      qc.setQueryData(['store-settings'], result.store);
      return result;
    },
    enabled: settings != null,
    refetchInterval: ONE_HOUR_MS,
    refetchIntervalInBackground: true,
    staleTime: ONE_HOUR_MS - 60_000,
  });
}

/** Sincroniza catálogo offline en segundo plano (no bloquea listados paginados). */
export function useCatalogBackgroundSync(enabled = true) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['catalog-background-sync'],
    enabled,
    queryFn: async () => {
      const customers = await apiFetch<Customer[]>('/customers').catch(() => [] as Customer[]);
      const products = await fetchAllProductsForCache();
      await cacheCatalog(products, customers);
      await pullSync(localStorage.getItem('bodepos_last_sync') ?? undefined);
      await flushOutbox();
      qc.setQueryData(['product-stock-map'], buildStockMap(products));
      return { productCount: products.length };
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

function buildStockMap(products: Product[]) {
  return new Map(products.map(p => [p.id, p.stock]));
}

/** Mapa id → stock (Dexie o última sync). */
export function useProductStockMap() {
  return useQuery({
    queryKey: ['product-stock-map'],
    queryFn: async () => {
      const cached = await getCachedProducts();
      if (cached.length > 0) return buildStockMap(cached);
      const products = await fetchAllProductsForCache();
      return buildStockMap(products);
    },
    staleTime: 60_000,
  });
}

export function useCustomers(search = '') {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: () => {
      const q = search.trim();
      const suffix = q ? `?q=${encodeURIComponent(q)}` : '';
      return apiFetch<Customer[]>(`/customers${suffix}`);
    },
  });
}

export function useCustomerDetail(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => apiFetch<CustomerDetail>(`/customers/${customerId}`),
    enabled: Boolean(customerId),
  });
}

export function useInvoices(date: string) {
  return useQuery({
    queryKey: ['invoices', date],
    queryFn: () => apiFetch<Invoice[]>(`/invoices?date=${date}`),
  });
}

export function useInvoiceSummary(date: string) {
  return useQuery({
    queryKey: ['invoice-summary', date],
    queryFn: () => apiFetch<InvoiceSummary>(`/invoices/summary?date=${date}`),
  });
}

export function useDailyIncomes() {
  return useQuery({
    queryKey: ['daily-incomes'],
    queryFn: () => apiFetch<unknown[]>('/daily-incomes'),
  });
}

export function useUpdateStoreSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<StoreSettings>) =>
      apiFetch<StoreSettings>('/store-settings', { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: data => {
      qc.setQueryData(['store-settings'], data);
      qc.invalidateQueries({ queryKey: ['exchange-rate-refresh'] });
      qc.invalidateQueries({ queryKey: ['products-infinite'] });
      qc.invalidateQueries({ queryKey: ['catalog-background-sync'] });
      qc.invalidateQueries({ queryKey: ['product-stock-map'] });
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Product> & { name: string; priceUsd: number; unit: Product['unit'] }) => {
      if (body.id) {
        const { id, ...rest } = body;
        return apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(rest) });
      }
      const { id: _id, ...rest } = body;
      return apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(rest) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products-infinite'] });
      qc.invalidateQueries({ queryKey: ['catalog-background-sync'] });
      qc.invalidateQueries({ queryKey: ['product-stock-map'] });
    },
  });
}

export function useSaveCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; phone?: string; debtUsd?: number }) =>
      apiFetch<Customer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
