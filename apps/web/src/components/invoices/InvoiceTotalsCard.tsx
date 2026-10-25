import {
  faCoins,
  faCreditCard,
  faDollarSign,
  faFingerprint,
  faHandHoldingDollar,
  faMobileScreenButton,
  faMoneyBillWave,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Flex, Grid, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { SummaryAmountHeader } from '@/components/ui/SummaryAmountCard';
import { GenericText } from '@/components/ui';
import type { InvoiceTotalsBreakdown } from '@/lib/invoices/totals';
import { formatBs, formatUsd, roundUsd } from '@/lib/money';

function isZero(n: number) {
  return roundUsd(n) <= 0;
}

const PAYMENT_META: Record<
  string,
  { icon: IconDefinition; colorPalette: 'green' | 'brand' | 'purple' | 'blue' | 'cyan' | 'orange' }
> = {
  usd: { icon: faDollarSign, colorPalette: 'green' },
  cashBs: { icon: faMoneyBillWave, colorPalette: 'brand' },
  biopago: { icon: faFingerprint, colorPalette: 'purple' },
  pos: { icon: faCreditCard, colorPalette: 'blue' },
  mobile: { icon: faMobileScreenButton, colorPalette: 'cyan' },
  credit: { icon: faHandHoldingDollar, colorPalette: 'orange' },
  totalBs: { icon: faCoins, colorPalette: 'green' },
};

type MetricTile = {
  id: string;
  label: string;
  value: string;
  muted: boolean;
  emphasize?: boolean;
};

function SummaryLine({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <Flex justify="space-between" align="center" gap={2} minW={0} py={0.5}>
      <GenericText variant="caption" color="gray.600" truncate>
        {label}
      </GenericText>
      <GenericText
        variant="body"
        fontSize="xs"
        flexShrink={0}
        color={muted ? 'gray.400' : 'gray.900'}
        fontWeight={muted ? 'normal' : 'medium'}
      >
        {value}
      </GenericText>
    </Flex>
  );
}

function PaymentMetricTile({ metric }: { metric: MetricTile }) {
  const meta = PAYMENT_META[metric.id] ?? PAYMENT_META.usd;
  const { icon, colorPalette } = meta;

  return (
    <Flex
      align="center"
      gap={2}
      px={2}
      py={1.5}
      minH="9"
      borderRadius="md"
      borderWidth="1px"
      borderColor={metric.emphasize ? `${colorPalette}.200` : 'gray.200'}
      bg={metric.muted ? 'gray.50' : metric.emphasize ? `${colorPalette}.50` : 'white'}
      boxShadow={metric.emphasize ? '0 1px 2px rgba(15, 23, 42, 0.04)' : 'none'}
    >
      <Flex
        boxSize={7}
        flexShrink={0}
        borderRadius="md"
        bg={`${colorPalette}.100`}
        color={`${colorPalette}.700`}
        align="center"
        justify="center"
      >
        <FontAwesomeIcon icon={icon} style={{ width: '0.75rem', height: '0.75rem' }} />
      </Flex>
      <GenericText variant="caption" color="gray.600" lineClamp={1} flex="1" minW={0} fontSize="xs">
        {metric.label}
      </GenericText>
      <GenericText
        variant="strong"
        fontSize="xs"
        fontVariantNumeric="tabular-nums"
        flexShrink={0}
        color={metric.muted ? 'gray.400' : 'gray.900'}
      >
        {metric.value}
      </GenericText>
    </Flex>
  );
}

function PaymentMetricsGrid({ metrics }: { metrics: MetricTile[] }) {
  return (
    <Grid
      templateColumns={{ md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }}
      gap={2}
    >
      {metrics.map(metric => (
        <PaymentMetricTile key={metric.id} metric={metric} />
      ))}
    </Grid>
  );
}

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
    <Box
      bg="white"
      borderRadius={{ base: 'md', md: 'xl' }}
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow={{ base: 'none', md: 'soft' }}
      overflow="hidden"
    >
      <SummaryAmountHeader
        label="Total facturado"
        amountUsd={breakdown.totalUsd}
        amountBs={breakdown.totalBs}
        headerRight={headerRight}
        footerBorder={showBreakdown}
      />

      {showBreakdown && paymentsMode === 'used' && (
        <>
          <Box display={{ base: 'block', md: 'none' }} px={3} py={2.5}>
            <Stack gap={0}>
              {usedLines.map(line => (
                <SummaryLine key={line.id} label={line.label} value={line.value} />
              ))}
            </Stack>
          </Box>
          <Box display={{ base: 'none', md: 'block' }} px={3} py={2} bg="surface.page">
            <PaymentMetricsGrid metrics={usedMetrics} />
          </Box>
        </>
      )}

      {showBreakdown && paymentsMode === 'full' && (
        <>
          <Box display={{ base: 'block', md: 'none' }} px={3} py={2.5}>
            <Grid templateColumns="1fr 1fr" gap={3}>
              <Stack gap={0}>
                <SummaryLine
                  label="USD"
                  value={formatUsd(breakdown.usdCash)}
                  muted={isZero(breakdown.usdCash)}
                />
                <SummaryLine
                  label="Bs Efectivo"
                  value={formatBs(breakdown.cashBs)}
                  muted={isZero(breakdown.cashBs)}
                />
                <SummaryLine
                  label="Biopago"
                  value={formatBs(breakdown.biopagoBs)}
                  muted={isZero(breakdown.biopagoBs)}
                />
                {credit > 0 && (
                  <SummaryLine label="Fiado" value={formatUsd(credit)} muted={false} />
                )}
              </Stack>
              <Stack gap={0}>
                <SummaryLine label="POS" value={formatBs(posTotal)} muted={isZero(posTotal)} />
                <SummaryLine
                  label="Pago móvil"
                  value={formatBs(breakdown.mobileBs)}
                  muted={isZero(breakdown.mobileBs)}
                />
                <SummaryLine
                  label="Total Bs"
                  value={formatBs(breakdown.totalBs)}
                  muted={isZero(breakdown.totalBs)}
                />
              </Stack>
            </Grid>
          </Box>
          <Box display={{ base: 'none', md: 'block' }} px={3} py={2} bg="surface.page">
            <PaymentMetricsGrid metrics={fullMetrics} />
          </Box>
        </>
      )}
    </Box>
  );
}
