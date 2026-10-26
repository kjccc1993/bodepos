import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { GenericText, type DataTableColumn } from '@/components/ui';
import { formatInvoiceCreatedAt } from '@/lib/invoices/format';
import { formatBs, formatUsd } from '@/lib/money';
import type { Invoice } from '@/lib/types';

export function buildInvoiceTableColumns(options?: {
  showCustomer?: boolean;
}): DataTableColumn<Invoice>[] {
  const showCustomer = options?.showCustomer ?? true;
  const cols: DataTableColumn<Invoice>[] = [
    {
      id: 'number',
      header: 'Nro',
      cell: inv => (
        <GenericText variant="strong" color="red.600">
          {inv.number}
        </GenericText>
      ),
    },
    {
      id: 'createdAt',
      header: 'Fecha',
      cell: inv => <GenericText variant="body">{formatInvoiceCreatedAt(inv.createdAt)}</GenericText>,
    },
    {
      id: 'totalUsd',
      header: 'USD',
      align: 'right',
      cell: inv => formatUsd(inv.totalUsd),
    },
    {
      id: 'totalBs',
      header: 'Bs',
      align: 'right',
      cell: inv => formatBs(inv.totalBs),
    },
    {
      id: 'lineCount',
      header: 'Productos',
      align: 'right',
      cell: inv => String(inv.lineCount),
    },
  ];

  if (showCustomer) {
    cols.push({
      id: 'customer',
      header: 'Cliente',
      cell: inv => inv.customerName ?? 'N/A',
    });
  }

  cols.push({
    id: 'status',
    header: 'Estado',
    cell: inv => <InvoiceStatusBadge status={inv.status} />,
  });

  return cols;
}
