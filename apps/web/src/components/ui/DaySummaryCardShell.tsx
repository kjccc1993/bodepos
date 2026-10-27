import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { softCardProps } from '@/lib/design/surface-styles';

/** Contenedor blanco (xl + soft) para tarjetas de totales por día (facturas / ingresos). */
export function DaySummaryCardShell({ children }: { children: ReactNode }) {
  return (
    <Box {...softCardProps} overflow="hidden" w="full">
      {children}
    </Box>
  );
}
