import { Box, Grid } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactNode, useMemo } from 'react';
import type { Product } from '@/lib/types';

/** Altura aproximada de ProductCardShell (sin separación entre filas). */
const ROW_HEIGHT = { sell: 112, admin: 112 } as const;
/** Debe coincidir con `gap` del grid. */
const ROW_GAP_PX = 8;

function chunkProducts(products: Product[], columnCount: number) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += columnCount) {
    rows.push(products.slice(i, i + columnCount));
  }
  return rows;
}

type Props = {
  products: Product[];
  columnCount: number;
  templateColumns: object | string;
  scrollRoot: HTMLElement | null;
  mode: 'sell' | 'admin';
  renderProduct: (product: Product) => ReactNode;
  listKey?: string;
};

export function VirtualizedProductGrid({
  products,
  columnCount,
  templateColumns,
  scrollRoot,
  mode,
  renderProduct,
  listKey = 'default',
}: Props) {
  const rows = useMemo(() => chunkProducts(products, columnCount), [products, columnCount]);
  const rowHeight = ROW_HEIGHT[mode];

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRoot,
    estimateSize: () => rowHeight + ROW_GAP_PX,
    overscan: 3,
    getItemKey: index => `${listKey}-row-${rows[index]?.[0]?.id ?? index}`,
  });

  if (rows.length === 0) return null;

  return (
    <Box position="relative" w="full" h={`${virtualizer.getTotalSize()}px`}>
      {virtualizer.getVirtualItems().map(vRow => {
        const rowProducts = rows[vRow.index] ?? [];
        return (
          <Grid
            key={vRow.key}
            position="absolute"
            top={0}
            left={0}
            w="full"
            transform={`translateY(${vRow.start}px)`}
            templateColumns={templateColumns}
            gap={`${ROW_GAP_PX}px`}
            pb={`${ROW_GAP_PX}px`}
            alignItems="start"
          >
            {rowProducts.map(p => renderProduct(p))}
          </Grid>
        );
      })}
    </Box>
  );
}
