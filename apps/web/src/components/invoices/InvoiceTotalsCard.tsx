import { Box, Flex, Grid, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { SummaryAmountHeader } from '@/components/ui/SummaryAmountCard';
import { GenericText } from '@/components/ui';
import type { InvoiceTotalsBreakdown } from '@/lib/invoices/totals';
import { formatBs, formatUsd, roundUsd } from '@/lib/money';

function isZero(n: number) {
  return roundUsd(n) <= 0;
}

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

  return (
    <Box bg="white" borderRadius="md" borderWidth="1px" overflow="hidden">
      <SummaryAmountHeader
        label="Total facturado"
        amountUsd={breakdown.totalUsd}
        amountBs={breakdown.totalBs}
        headerRight={headerRight}
        footerBorder={showBreakdown}
      />

      {showBreakdown && paymentsMode === 'used' && (
        <Box px={3} py={2.5}>
          <Stack gap={0}>
            {usedLines.map(line => (
              <SummaryLine key={line.id} label={line.label} value={line.value} />
            ))}
          </Stack>
        </Box>
      )}

      {showBreakdown && paymentsMode === 'full' && (
        <Box px={3} py={2.5}>
          <Grid templateColumns="1fr 1fr" gap={{ base: 3, md: 6 }}>
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
      )}
    </Box>
  );
}
