import type { Customer, DailyIncome, Invoice, InvoiceLine, ProductCategory, Store } from '@prisma/client';
import type { ProductWithCategory } from './product-include.js';
import { isManualRateActiveToday } from './exchange-rates/rate-day.js';
import { resolveEffectiveRate, type RateSource } from './exchange-rates/service.js';
import { toNumber } from '../shared/money.js';

export function serializeStore(store: Store) {
  const effectiveRate = resolveEffectiveRate(store);
  const rateSource: RateSource = isManualRateActiveToday(store.manualRateSetAt) ? 'manual' : 'bcv';

  return {
    id: store.id,
    name: store.name,
    customRate: toNumber(store.customRate),
    useFixedRate: store.useFixedRate,
    bcvRate: store.bcvRate != null ? toNumber(store.bcvRate) : null,
    bcvRateFetchedAt: store.bcvRateFetchedAt?.toISOString() ?? null,
    manualRateSetAt: store.manualRateSetAt?.toISOString() ?? null,
    effectiveRate,
    rateSource,
  };
}

export function serializeProductCategory(c: ProductCategory | null) {
  if (!c || !c.isActive) return null;
  return {
    id: c.id,
    name: c.name,
    sortOrder: c.sortOrder,
  };
}

export function serializeProduct(p: ProductWithCategory, rate: number) {
  const priceUsd = toNumber(p.priceUsd);
  return {
    id: p.id,
    name: p.name,
    priceUsd,
    priceBs: Math.round(priceUsd * rate * 100) / 100,
    costUsd: toNumber(p.costUsd),
    unit: p.unit,
    stock: toNumber(p.stock),
    barcode: p.barcode,
    lowStockThreshold: p.lowStockThreshold ? toNumber(p.lowStockThreshold) : null,
    isActive: p.isActive,
    colorTag: p.colorTag,
    categoryId: p.categoryId,
    category: serializeProductCategory(p.category),
  };
}

export function serializeCustomer(c: Customer, rate: number) {
  const debtUsd = toNumber(c.debtUsd);
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    debtUsd,
    debtBs: Math.round(debtUsd * rate * 100) / 100,
    colorTag: c.colorTag,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

export function serializeInvoice(inv: Invoice & { lines: InvoiceLine[]; customer?: Customer | null }, rate: number) {
  return {
    id: inv.id,
    number: inv.number.toString().padStart(12, '0'),
    status: inv.status,
    customerId: inv.customerId,
    customerName: inv.customer?.name ?? null,
    rateApplied: toNumber(inv.rateApplied),
    totalUsd: toNumber(inv.totalUsd),
    totalBs: toNumber(inv.totalBs),
    payments: {
      usdCash: toNumber(inv.paidUsdCash),
      posBs: toNumber(inv.paidPosBs),
      pos2Bs: toNumber(inv.paidPos2Bs),
      mobileBs: toNumber(inv.paidMobileBs),
      cashBs: toNumber(inv.paidCashBs),
      biopagoBs: toNumber(inv.paidBiopagoBs),
    },
    change: {
      usd: toNumber(inv.changeUsd),
      bs: toNumber(inv.changeBs),
      mobileBs: toNumber(inv.changeMobileBs),
    },
    creditUsd: toNumber(inv.creditUsd),
    lineCount: inv.lines.length,
    lines: inv.lines.map(l => ({
      productId: l.productId,
      productName: l.productName,
      quantity: toNumber(l.quantity),
      unit: l.unit,
      unitPriceUsd: toNumber(l.unitPriceUsd),
      lineTotalUsd: toNumber(l.lineTotalUsd),
    })),
    createdAt: inv.createdAt.toISOString(),
  };
}

export function serializeDailyIncome(d: DailyIncome) {
  return {
    id: d.id,
    date: d.date.toISOString().slice(0, 10),
    usdCash: toNumber(d.usdCash),
    cashBs: toNumber(d.cashBs),
    posBs: toNumber(d.posBs),
    pos2Bs: toNumber(d.pos2Bs),
    mobileBs: toNumber(d.mobileBs),
    biopagoBs: toNumber(d.biopagoBs),
    totalUsd: toNumber(d.totalUsd),
    totalBs: toNumber(d.totalBs),
    createdAt: d.createdAt.toISOString(),
  };
}
