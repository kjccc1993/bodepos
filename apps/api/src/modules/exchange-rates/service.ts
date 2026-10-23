import type { Store } from '@prisma/client';
import { toNumber } from '../../shared/money.js';
import { prisma } from '../../shared/prisma.js';
import { fetchBancaribeExchangeRates } from './client.js';
import { getBanksMicroserviceConfig } from './config.js';
import { isManualRateActiveToday } from './rate-day.js';

export const BCV_REFRESH_MS = 60 * 60 * 1000;

export type RateSource = 'manual' | 'bcv';

export type ExchangeRateRefreshResult = {
  rate: number;
  source: RateSource;
  fetchedAt: string | null;
  refreshed: boolean;
};

export function resolveEffectiveRate(store: Store): number {
  if (isManualRateActiveToday(store.manualRateSetAt)) {
    return toNumber(store.customRate);
  }
  if (store.bcvRate != null) return toNumber(store.bcvRate);
  return toNumber(store.customRate);
}

export async function resolveEffectiveRateForStore(storeId: string): Promise<number> {
  const store = await normalizeStoreRateState(storeId);
  return resolveEffectiveRate(store);
}

/** Limpia override manual de días anteriores y el flag legacy useFixedRate. */
export async function normalizeStoreRateState(storeId: string): Promise<Store> {
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const data: { manualRateSetAt?: null; useFixedRate?: boolean } = {};

  if (store.manualRateSetAt && !isManualRateActiveToday(store.manualRateSetAt)) {
    data.manualRateSetAt = null;
  }
  if (store.useFixedRate) {
    data.useFixedRate = false;
  }

  if (Object.keys(data).length === 0) return store;
  return prisma.store.update({ where: { id: storeId }, data });
}

function isBcvCacheFresh(store: Store, nowMs: number): boolean {
  if (store.bcvRate == null || store.bcvRateFetchedAt == null) return false;
  return nowMs - store.bcvRateFetchedAt.getTime() < BCV_REFRESH_MS;
}

/**
 * Actualiza la tasa BCV si el caché tiene más de 1 h.
 * El override manual solo aplica el mismo día; al cambiar de día se limpia y prevalece BCV.
 */
export async function refreshBcvRateIfNeeded(
  storeId: string,
  options?: { force?: boolean },
): Promise<ExchangeRateRefreshResult> {
  let store = await normalizeStoreRateState(storeId);
  const nowMs = Date.now();

  if (!options?.force && isBcvCacheFresh(store, nowMs)) {
    return {
      rate: resolveEffectiveRate(store),
      source: isManualRateActiveToday(store.manualRateSetAt) ? 'manual' : 'bcv',
      fetchedAt: store.bcvRateFetchedAt!.toISOString(),
      refreshed: false,
    };
  }

  try {
    const config = getBanksMicroserviceConfig();
    const fetched = await fetchBancaribeExchangeRates(config);
    const fetchedAt = new Date();

    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { bcvRate: fetched.usdBcv, bcvRateFetchedAt: fetchedAt },
      }),
      prisma.bcvRateSnapshot.create({
        data: { storeId, rate: fetched.usdBcv, fetchedAt },
      }),
    ]);

    store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });

    return {
      rate: resolveEffectiveRate(store),
      source: isManualRateActiveToday(store.manualRateSetAt) ? 'manual' : 'bcv',
      fetchedAt: fetchedAt.toISOString(),
      refreshed: true,
    };
  } catch (err) {
    if (store.bcvRate != null) {
      return {
        rate: resolveEffectiveRate(store),
        source: isManualRateActiveToday(store.manualRateSetAt) ? 'manual' : 'bcv',
        fetchedAt: store.bcvRateFetchedAt?.toISOString() ?? null,
        refreshed: false,
      };
    }

    throw err;
  }
}
