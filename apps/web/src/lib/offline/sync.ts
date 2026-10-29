import { v4 as uuid } from 'uuid';
import { apiFetch } from '@/lib/http/client';
import { offlineDb, type OutboxOp } from './db';
import type { Product, Customer } from '@/lib/types';

export function isOnline() {
  return navigator.onLine;
}

export async function cacheCatalog(products: Product[], customers: Customer[]) {
  await offlineDb.products.clear();
  await offlineDb.customers.clear();
  if (products.length) await offlineDb.products.bulkPut(products);
  if (customers.length) await offlineDb.customers.bulkPut(customers);
}

export async function getCachedProducts(): Promise<Product[]> {
  const rows = await offlineDb.products.orderBy('name').toArray();
  return rows.map(product => {
    if ((product.unit as string) !== 'GRAM') return product;
    return { ...product, unit: 'KG', stock: product.stock / 1000 };
  });
}

export async function queueOutbox(kind: OutboxOp['kind'], payload: unknown) {
  const clientOpId = uuid();
  await offlineDb.outbox.add({
    clientOpId,
    kind,
    payload: JSON.stringify(payload),
    createdAt: Date.now(),
  });
  return clientOpId;
}

export async function flushOutbox() {
  if (!isOnline()) return;
  const ops = await offlineDb.outbox.orderBy('createdAt').toArray();
  if (ops.length === 0) return;

  const operations = ops.map(op => ({
    kind: op.kind,
    clientOpId: op.clientOpId,
    payload: JSON.parse(op.payload) as Record<string, unknown>,
  }));

  await apiFetch('/sync/push', {
    method: 'POST',
    body: JSON.stringify({ operations }),
  });

  await offlineDb.outbox.clear();
}

export async function pullSync(since?: string) {
  if (!isOnline()) return;
  const q = since ? `?since=${encodeURIComponent(since)}` : '';
  const data = await apiFetch<{
    products: Product[];
    customers: Customer[];
    serverTime: string;
  }>(`/sync/pull${q}`);
  if (data.products.length || data.customers.length) {
    await cacheCatalog(data.products, data.customers);
  }
  localStorage.setItem('bodepos_last_sync', data.serverTime);
}
