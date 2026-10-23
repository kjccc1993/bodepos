import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/http/client';
import type { Customer, ExchangeRateRefreshResult, Invoice, Product, StoreSettings } from '@/lib/types';
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

export function useProducts(search = '') {
  return useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      try {
        const q = search ? `?q=${encodeURIComponent(search)}` : '';
        const list = await apiFetch<Product[]>(`/products${q}`);
        const customers = await apiFetch<Customer[]>('/customers').catch(() => [] as Customer[]);
        await cacheCatalog(list, customers);
        void pullSync(localStorage.getItem('bodepos_last_sync') ?? undefined);
        void flushOutbox();
        return list;
      } catch {
        return getCachedProducts();
      }
    },
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch<Customer[]>('/customers'),
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
    queryFn: () => apiFetch<Record<string, number>>(`/invoices/summary?date=${date}`),
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
      qc.invalidateQueries({ queryKey: ['products'] });
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useSaveCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; phone?: string }) =>
      apiFetch<Customer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
