import Dexie, { type Table } from 'dexie';
import type { Customer, Product } from '@/lib/types';

export type OutboxOp = {
  id?: number;
  clientOpId: string;
  kind: 'checkout' | 'customer_payment';
  payload: string;
  createdAt: number;
};

class BodeDb extends Dexie {
  products!: Table<Product, string>;
  customers!: Table<Customer, string>;
  outbox!: Table<OutboxOp, number>;

  constructor() {
    super('bodepos');
    this.version(1).stores({
      products: 'id, name, barcode',
      customers: 'id, name',
      outbox: '++id, clientOpId, createdAt',
    });
  }
}

export const offlineDb = new BodeDb();
