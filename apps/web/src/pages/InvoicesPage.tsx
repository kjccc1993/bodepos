import { Box, Flex, Stack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import { InvoiceDaySummaryPanel } from '@/components/invoices/InvoiceDaySummaryPanel';
import { InvoiceDetailDialog } from '@/components/invoices/InvoiceDetailDialog';
import { InvoiceListCard } from '@/components/invoices/InvoiceListCard';
import {
  GenericDataTable,
  GenericDatePicker,
  GenericHeading,
} from '@/components/ui';
import { buildInvoiceTableColumns } from '@/lib/invoices/table-columns';
import { useInvoiceSummary, useInvoices } from '@/lib/api/hooks';
import { formatInvoiceFilterDate } from '@/lib/invoices/format';
import { VENEZUELA_TIME_ZONE } from '@/lib/utils/calendar';
import { apiFetch } from '@/lib/http/client';
import type { Invoice } from '@/lib/types';

export function InvoicesPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const { data: invoices = [], refetch } = useInvoices(date);
  const { data: summary } = useInvoiceSummary(date);

  const openDetail = useCallback((invoice: Invoice) => {
    setDetailInvoice(invoice);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailInvoice(null);
  }, []);

  const deleteInvoice = useCallback(
    async (id: string) => {
      await apiFetch(`/invoices/${id}`, { method: 'DELETE' });
      setDetailInvoice(current => (current?.id === id ? null : current));
      void refetch();
    },
    [refetch],
  );

  const columns = useMemo(() => buildInvoiceTableColumns({ showCustomer: true }), []);

  return (
    <Stack gap={3} flex="1" minH={0} h={0} overflowY="auto">
      <Flex align="center" gap={2}>
        <BackChevronLink to="/accounting" aria-label="Volver a contabilidad" />
        <GenericHeading>Facturas</GenericHeading>
      </Flex>

      <GenericDatePicker
        value={date}
        onChange={v => {
          if (v) setDate(v);
        }}
        timeZone={VENEZUELA_TIME_ZONE}
        locale="es"
        aria-label={`Filtrar por fecha (${formatInvoiceFilterDate(date)})`}
      />

      {summary && <InvoiceDaySummaryPanel summary={summary} />}

      <Stack gap={2} display={{ base: 'flex', md: 'none' }}>
        {invoices.map(inv => (
          <InvoiceListCard key={inv.id} invoice={inv} onOpen={() => openDetail(inv)} />
        ))}
      </Stack>

      <Box display={{ base: 'none', md: 'block' }}>
        <GenericDataTable
          columns={columns}
          rows={invoices}
          getRowKey={inv => inv.id}
          emptyMessage="No hay facturas para esta fecha"
          onRowClick={openDetail}
        />
      </Box>

      <InvoiceDetailDialog
        invoice={detailInvoice}
        open={detailInvoice != null}
        onClose={closeDetail}
        onDelete={inv => deleteInvoice(inv.id)}
        onInvoiceUpdated={inv => {
          setDetailInvoice(inv);
          void refetch();
        }}
      />
    </Stack>
  );
}
