import { AppError } from '../../shared/errors.js';
import type { BanksMicroserviceConfig } from './config.js';

const BANCARIBE_PATH = '/api/banks/bancaribe/exchange-rate/query';

type BancaribeExchangeRatesApiResponse = {
  rates?: {
    usdBcv?: unknown;
    eurBcv?: unknown;
  };
};

const fetchJson = async <T>(url: string, timeoutMs: number): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        502,
        'EXCHANGE_RATES_UPSTREAM_ERROR',
        `El microservicio de bancos respondió con estado ${response.status}`,
      );
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AppError(
        504,
        'EXCHANGE_RATES_UPSTREAM_TIMEOUT',
        'Tiempo de espera agotado al consultar la tasa BCV',
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

const parsePositiveRate = (value: unknown, label: string): number => {
  const n = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(n) || n <= 0) {
    throw new AppError(
      502,
      'EXCHANGE_RATES_INVALID_PAYLOAD',
      `Tasa inválida en respuesta del microservicio (${label})`,
    );
  }

  return n;
};

/** Tasas BCV USD/EUR desde Bancaribe vía bank-service. */
export async function fetchBancaribeExchangeRates(
  config: BanksMicroserviceConfig,
): Promise<{ readonly usdBcv: number; readonly eurBcv: number }> {
  const url = `${config.baseUrl}${BANCARIBE_PATH}`;
  const body = await fetchJson<BancaribeExchangeRatesApiResponse>(url, config.timeoutMs);

  if (body?.rates == null || typeof body.rates !== 'object') {
    throw new AppError(
      502,
      'EXCHANGE_RATES_INVALID_PAYLOAD',
      'Respuesta inválida del microservicio Bancaribe',
    );
  }

  return {
    usdBcv: parsePositiveRate(body.rates.usdBcv, 'usdBcv'),
    eurBcv: parsePositiveRate(body.rates.eurBcv, 'eurBcv'),
  };
}
