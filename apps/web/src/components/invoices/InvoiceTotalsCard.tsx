import type { ReactNode } from 'react';
import { PaymentAmountsSection } from '@/components/payments/PaymentAmountsSection';
import type { PaymentMetricTileData } from '@/components/payments/PaymentMetricTile';
import { DaySummaryCardShell } from '@/components/ui/DaySummaryCardShell';
import { SummaryAmountHeader } from '@/components/ui/SummaryAmountCard';
import type { InvoiceTotalsBreakdown } from '@/lib/invoices/totals';
import { formatBs, formatUsd, roundUsd } from '@/lib/money';

function isZero(n: number) {
  return roundUsd(n) <= 0;
}

type MetricTile = PaymentMetricTileData & { muted: boolean };

type PaymentLine = { id: string; label: string; value: string };

function buildUsedPaymentLines(
  breakdown: InvoiceTotalsBreakdown,
  posTotal: number,
  credit: number,
): PaymentLine[] {
  const lines: PaymentLine[] = [];
  if (!isZero(breakdown.usdCash)) {
    lines.push({ id: 'usd', label: 'USD', value: formatUsd(breakdown.usdCash) });
  }
  if (!isZero(breakdown.cashBs)) {
    lines.push({ id: 'cashBs', label: 'Bs Efectivo', value: formatBs(breakdown.cashBs) });
  }
  if (!isZero(breakdown.biopagoBs)) {
    lines.push({ id: 'biopago', label: 'Biopago', value: formatBs(breakdown.biopagoBs) });
  }
  if (!isZero(posTotal)) {
    lines.push({ id: 'pos', label: 'POS', value: formatBs(posTotal) });
  }
  if (!isZero(breakdown.mobileBs)) {
    lines.push({ id: 'mobile', label: 'Pago móvil', value: formatBs(breakdown.mobileBs) });
  }
  if (credit > 0) {
    lines.push({ id: 'credit', label: 'Fiado', value: formatUsd(credit) });
  }
  return lines;
}

function buildFullMetrics(
  breakdown: InvoiceTotalsBreakdown,
  posTotal: number,
  credit: number,
): MetricTile[] {
  const metrics: MetricTile[] = [
    {
      id: 'usd',
      label: 'USD',
      value: formatUsd(breakdown.usdCash),
      muted: isZero(breakdown.usdCash),
    },
    {
      id: 'cashBs',
      label: 'Bs Efectivo',
      value: formatBs(breakdown.cashBs),
      muted: isZero(breakdown.cashBs),
    },
    {
      id: 'biopago',
      label: 'Biopago',
      value: formatBs(breakdown.biopagoBs),
      muted: isZero(breakdown.biopagoBs),
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
      value: formatBs(breakdown.mobileBs),
      muted: isZero(breakdown.mobileBs),
    },
    {
      id: 'totalBs',
      label: 'Total Bs',
      value: formatBs(breakdown.totalBs),
      muted: isZero(breakdown.totalBs),
      emphasize: true,
    },
  ];
  if (credit > 0) {
    metrics.splice(3, 0, {
      id: 'credit',
      label: 'Fiado',
      value: formatUsd(credit),
      muted: false,
    });
  }
  return metrics;
}

function usedLinesToMetrics(lines: PaymentLine[]): MetricTile[] {
  return lines.map(line => ({
    id: line.id,
    label: line.label,
    value: line.value,
    muted: false,
  }));
}

type Props = {
  breakdown: InvoiceTotalsBreakdown;
  /** Texto arriba a la derecha (p. ej. «2 facturas» o «3 productos»). */
  headerRight?: ReactNode;
  creditUsd?: number;
  /** `used`: solo medios con monto; `full`: cuadrícula fija del día (incl. ceros atenuados). */
  paymentsMode?: 'full' | 'used';
};

export function InvoiceTotalsCard({
  breakdown,
  headerRight,
  creditUsd = 0,
  paymentsMode = 'full',
}: Props) {
  const posTotal = roundUsd(breakdown.posBs + breakdown.pos2Bs);
  const credit = roundUsd(creditUsd);
  const usedLines = buildUsedPaymentLines(breakdown, posTotal, credit);
  const showBreakdown = paymentsMode === 'full' || usedLines.length > 0;
  const fullMetrics = buildFullMetrics(breakdown, posTotal, credit);
  const usedMetrics = usedLinesToMetrics(usedLines);

  return (
    <DaySummaryCardShell>
      <SummaryAmountHeader
        label="Total facturado"
        amountUsd={breakdown.totalUsd}
        amountBs={breakdown.totalBs}
        headerRight={headerRight}
        footerBorder={showBreakdown}
      />

      {showBreakdown ? (
        <PaymentAmountsSection
          metrics={paymentsMode === 'full' ? fullMetrics : usedMetrics}
        />
      ) : null}
    </DaySummaryCardShell>
  );
}
