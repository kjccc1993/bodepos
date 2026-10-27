import { Flex } from '@chakra-ui/react';
import { DailyIncomeAmountsGrid } from '@/components/daily-incomes/DailyIncomeAmountsGrid';
import { DailyIncomeDeleteButton } from '@/components/daily-incomes/DailyIncomeDeleteButton';
import { DailyIncomeEditButton } from '@/components/daily-incomes/DailyIncomeEditButton';
import { DaySummaryCardShell } from '@/components/ui/DaySummaryCardShell';
import { SummaryAmountHeader } from '@/components/ui/SummaryAmountCard';
import { formatInvoiceFilterDate } from '@/lib/invoices/format';
import type { DailyIncome } from '@/lib/types';

type Props = {
  row: DailyIncome;
  onEdit: (row: DailyIncome) => void;
  onDelete: (row: DailyIncome) => void;
};

export function DailyIncomeDaySummaryCard({ row, onEdit, onDelete }: Props) {
  const dateLabel = formatInvoiceFilterDate(row.date);

  return (
    <DaySummaryCardShell>
      <SummaryAmountHeader
        label={dateLabel}
        amountUsd={row.totalUsd}
        amountBs={row.totalBs}
        footerBorder
        trailingActions={
          <Flex align="stretch" gap="10px" onClick={e => e.stopPropagation()}>
            <DailyIncomeEditButton
              ariaLabel={`Editar ingreso del ${dateLabel}`}
              onClick={e => {
                e.stopPropagation();
                onEdit(row);
              }}
            />
            <DailyIncomeDeleteButton
              ariaLabel={`Eliminar ingreso del ${dateLabel}`}
              onClick={e => {
                e.stopPropagation();
                onDelete(row);
              }}
            />
          </Flex>
        }
      />

      <DailyIncomeAmountsGrid amounts={row} />
    </DaySummaryCardShell>
  );
}
