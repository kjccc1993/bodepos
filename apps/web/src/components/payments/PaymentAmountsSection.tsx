import { Box, Grid } from '@chakra-ui/react';
import {
  PaymentMetricTile,
  type PaymentMetricTileData,
} from '@/components/payments/PaymentMetricTile';

type Props = {
  metrics: PaymentMetricTileData[];
  /** Si true, envuelve la rejilla con fondo surface.page (listados). */
  section?: boolean;
};

function PaymentAmountsGrid({ metrics }: { metrics: PaymentMetricTileData[] }) {
  return (
    <Grid
      templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }}
      gap={2}
      w="full"
    >
      {metrics.map(metric => (
        <PaymentMetricTile key={metric.id} metric={metric} variant="borderless" />
      ))}
    </Grid>
  );
}

/** Rejilla de medios de pago sobre fondo gris (misma en facturas e ingresos diarios). */
export function PaymentAmountsSection({ metrics, section = true }: Props) {
  const grid = <PaymentAmountsGrid metrics={metrics} />;

  if (!section) return grid;

  return (
    <Box px={3} py={2.5} bg="surface.page" w="full">
      {grid}
    </Box>
  );
}
