import type { PaymentMetricTileData } from '@/components/payments/PaymentMetricTile';
import { formatBs, formatUsd, roundUsd } from '@/lib/money';

export type DailyIncomeAmounts = {
  usdCash: number;
  cashBs: number;
  posBs: number;
  pos2Bs: number;
  mobileBs: number;
  biopagoBs: number;
  totalBs: number;
};

function isZero(n: number) {
  return roundUsd(n) <= 0;
}

/** Métricas fijas del desglose (POS = pos + pos2, como en facturas). */
export function dailyIncomeAmountMetrics(amounts: DailyIncomeAmounts): PaymentMetricTileData[] {
  const posTotal = roundUsd(amounts.posBs + amounts.pos2Bs);

  return [
    {
      id: 'usd',
      label: 'USD',
      value: formatUsd(amounts.usdCash),
      muted: isZero(amounts.usdCash),
    },
    {
      id: 'cashBs',
      label: 'Bs Efectivo',
      value: formatBs(amounts.cashBs),
      muted: isZero(amounts.cashBs),
    },
    {
      id: 'biopago',
      label: 'Biopago',
      value: formatBs(amounts.biopagoBs),
      muted: isZero(amounts.biopagoBs),
    },
    {
      id: 'pos',
      label: 'POS',
      value: formatBs(posTotal),
      muted: isZero(posTotal),
    },
    {
      id: 'mobile',
      label: 'Pago móvil',
      value: formatBs(amounts.mobileBs),
      muted: isZero(amounts.mobileBs),
    },
    {
      id: 'totalBs',
      label: 'Total Bs',
      value: formatBs(amounts.totalBs),
      muted: isZero(amounts.totalBs),
      emphasize: true,
    },
  ];
}

/** @deprecated Use dailyIncomeAmountMetrics */
export function dailyIncomeHistoryMetrics(
  row: DailyIncomeAmounts & { id?: string; date?: string },
): PaymentMetricTileData[] {
  return dailyIncomeAmountMetrics(row);
}
