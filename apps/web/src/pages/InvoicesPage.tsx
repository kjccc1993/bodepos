import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GenericHeading, GenericInput, GenericText } from '@/components/ui';
import { useInvoiceSummary, useInvoices } from '@/lib/api/hooks';
import { formatUsd } from '@/lib/money';
import { apiFetch } from '@/lib/http/client';

export function InvoicesPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data: invoices = [], refetch } = useInvoices(date);
  const { data: summary } = useInvoiceSummary(date);

  return (
    <Stack gap={3} flex="1" minH={0} h={0} overflowY="auto">
      <Flex align="center" gap={2}>
        <Link to="/accounting">←</Link>
        <GenericHeading>Facturas</GenericHeading>
      </Flex>
      <GenericInput type="date" value={date} onChange={e => setDate(e.target.value)} />
      {summary && (
        <Box bg="white" p={3} borderRadius="md" borderWidth="1px">
          <GenericText variant="body">{summary.count} facturas</GenericText>
          <GenericText variant="body">Total USD: {formatUsd(summary.totalUsd ?? 0)}</GenericText>
          <GenericText variant="body">Total Bs: {(summary.totalBs ?? 0).toLocaleString('es-VE')}</GenericText>
        </Box>
      )}
      {invoices.map(inv => (
        <Box key={inv.id} bg="white" p={3} borderRadius="md" borderWidth="1px">
          <Flex justify="space-between">
            <GenericText variant="strong" color="red.600">
              Nro: {inv.number}
            </GenericText>
            <GenericText variant="body" color={inv.status === 'PAID' ? 'green.600' : 'orange.600'}>
              {inv.status === 'PAID' ? 'Pagada' : 'Pendiente'}
            </GenericText>
          </Flex>
          <GenericText variant="body">{new Date(inv.createdAt).toLocaleString('es-VE')}</GenericText>
          <GenericText variant="body">
            {formatUsd(inv.totalUsd)} / Bs {inv.totalBs.toLocaleString('es-VE')}
          </GenericText>
          <GenericText variant="caption">
            Productos: {inv.lineCount} — Cliente: {inv.customerName ?? 'N/A'}
          </GenericText>
          <Button
            size="xs"
            mt={2}
            variant="outline"
            colorPalette="red"
            onClick={async () => {
              if (!confirm('¿Eliminar factura?')) return;
              await apiFetch(`/invoices/${inv.id}`, { method: 'DELETE' });
              void refetch();
            }}
          >
            Eliminar
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
