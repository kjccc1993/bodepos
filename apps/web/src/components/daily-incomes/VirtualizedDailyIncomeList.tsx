import { Box } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DailyIncomeDaySummaryCard } from '@/components/daily-incomes/DailyIncomeDaySummaryCard';
import type { DailyIncome } from '@/lib/types';

/** Altura aproximada: fila fecha/acciones + encabezado de totales + rejilla 2×3. */
const CARD_HEIGHT = 280;
const CARD_GAP_PX = 8;

type Props = {
  rows: DailyIncome[];
  scrollRoot: HTMLElement | null;
  onEdit: (row: DailyIncome) => void;
  onDelete: (row: DailyIncome) => void;
};

export function VirtualizedDailyIncomeList({ rows, scrollRoot, onEdit, onDelete }: Props) {
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRoot,
    estimateSize: () => CARD_HEIGHT + CARD_GAP_PX,
    overscan: 5,
    getItemKey: index => rows[index]?.id ?? index,
  });

  if (rows.length === 0) return null;

  return (
    <Box position="relative" w="full" h={`${virtualizer.getTotalSize()}px`}>
      {virtualizer.getVirtualItems().map(vRow => {
        const row = rows[vRow.index];
        if (!row) return null;
        return (
          <Box
            key={vRow.key}
            position="absolute"
            top={0}
            left={0}
            w="full"
            transform={`translateY(${vRow.start}px)`}
            pb={`${CARD_GAP_PX}px`}
          >
            <DailyIncomeDaySummaryCard row={row} onEdit={onEdit} onDelete={onDelete} />
          </Box>
        );
      })}
    </Box>
  );
}
