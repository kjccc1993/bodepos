import { Box, Flex, Stack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InvoiceDetailDialog } from '@/components/invoices/InvoiceDetailDialog';
import { InvoiceListCard } from '@/components/invoices/InvoiceListCard';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import { GenericHeading, GenericText } from '@/components/ui';
import { SummaryAmountCard } from '@/components/ui/SummaryAmountCard';
import { useCustomerDetail } from '@/lib/api/hooks';
import { apiFetch } from '@/lib/http/client';
import type { Invoice } from '@/lib/types';

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const { data: customer, refetch } = useCustomerDetail(customerId);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);

  const pendingCount = useMemo(
    () => customer?.invoices.filter(inv => inv.status === 'PENDING').length ?? 0,
    [customer?.invoices],
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      await apiFetch(`/invoices/${id}`, { method: 'DELETE' });
      setDetailInvoice(current => (current?.id === id ? null : current));
      void refetch();
    },
    [refetch],
  );

  if (!customer) {
    return (
      <Box px={3} py={4}>
        <GenericText variant="muted">Cargando cliente…</GenericText>
      </Box>
    );
  }

  return (
    <Flex
      direction="column"
      flex="1"
      minH={0}
      h={0}
      mx={{ base: -3, lg: -5 }}
      mt={{ base: -3, lg: -4 }}
      mb={{ base: -3, lg: -4 }}
    >
      <Box flexShrink={0} px={3} pt={3} pb={2} bg="white" borderBottomWidth="1px" borderColor="gray.200">
        <Flex align="center" gap={2} minW={0}>
          <BackChevronLink to="/accounting/customers" aria-label="Volver a clientes" />
          <GenericHeading flex="1" minW={0} lineClamp={1}>
            {customer.name}
          </GenericHeading>
        </Flex>
      </Box>

      <Box flex="1" minH={0} h={0} overflowY="auto" overscrollBehavior="contain" px={3} py={3} pb={4}>
        <Stack gap={3}>
          <SummaryAmountCard
            label="Deuda total"
            amountUsd={customer.debtUsd}
            amountBs={customer.debtBs}
            headerRight={
              pendingCount > 0
                ? `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}`
                : undefined
            }
          />

          <Box>
            <Flex align="baseline" justify="space-between" gap={2} mb={2}>
              <GenericHeading variant="section" fontSize="sm">
                Facturas
              </GenericHeading>
              <GenericText variant="caption">
                {customer.invoices.length} total
                {pendingCount > 0 ? ` · ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : ''}
              </GenericText>
            </Flex>

            {customer.invoices.length === 0 ? (
              <GenericText variant="muted" py={4} textAlign="center">
                Este cliente aún no tiene facturas.
              </GenericText>
            ) : (
              <Stack gap={2}>
                {customer.invoices.map(inv => (
                  <InvoiceListCard key={inv.id} invoice={inv} onOpen={() => setDetailInvoice(inv)} />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      <InvoiceDetailDialog
        invoice={detailInvoice}
        open={detailInvoice != null}
        onClose={() => setDetailInvoice(null)}
        onDelete={inv => deleteInvoice(inv.id)}
      />
    </Flex>
  );
}
