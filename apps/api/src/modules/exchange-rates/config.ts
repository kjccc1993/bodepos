import { AppError } from '../../shared/errors.js';

/**
 * Microservicio de bancos (Bancaribe BCV).
 *
 * - `BANKS_MICROSERVICE_URL` — URL base (obligatorio si useFixedRate=false).
 * - `BANKS_MICROSERVICE_TIMEOUT_MS` — timeout en ms (default 15000).
 */
export type BanksMicroserviceConfig = {
  readonly baseUrl: string;
  readonly timeoutMs: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

export function getBanksMicroserviceConfig(): BanksMicroserviceConfig {
  const baseUrl = (process.env.BANKS_MICROSERVICE_URL?.trim() ?? '').replace(/\/+$/u, '');

  if (baseUrl.length === 0) {
    throw new AppError(
      503,
      'BANKS_BRIDGE_NOT_CONFIGURED',
      'Integración de tasas no disponible: falta BANKS_MICROSERVICE_URL en el servidor.',
    );
  }

  const timeoutRaw = process.env.BANKS_MICROSERVICE_TIMEOUT_MS?.trim();
  const timeoutMs = timeoutRaw ? Number(timeoutRaw) : DEFAULT_TIMEOUT_MS;

  return { baseUrl, timeoutMs };
}
