import { breakdownFromInvoiceSummary } from '@/lib/invoices/totals';
import type { InvoiceSummary } from '@/lib/types';
import { InvoiceTotalsCard } from '@/components/invoices/InvoiceTotalsCard';

export function InvoiceDaySummaryPanel({ summary }: { summary: InvoiceSummary }) {
  const countLabel = `${summary.count} factura${summary.count === 1 ? '' : 's'}`;

  return (
    <InvoiceTotalsCard
      breakdown={breakdownFromInvoiceSummary(summary)}
      headerRight={countLabel}
    />
  );
}
