import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerQuickCreateDialog } from '@/components/customers/CustomerQuickCreateDialog';
import { CustomerListCard } from '@/components/customers/CustomerListCard';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import {
  GenericDataTable,
  GenericHeading,
  GenericSearchInput,
  GenericText,
  type DataTableColumn,
} from '@/components/ui';
import { useCustomers } from '@/lib/api/hooks';
import { formatCustomerSince } from '@/lib/customers/format';
import { formatBs, formatUsd } from '@/lib/money';
import type { Customer } from '@/lib/types';

export function CustomersPage() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { data: customers = [] } = useCustomers(search);

  const columns = useMemo((): DataTableColumn<Customer>[] => {
    return [
      {
        id: 'name',
        header: 'Cliente',
        cell: c => (
          <GenericText variant="strong" fontSize="sm">
            {c.name}
          </GenericText>
        ),
      },
      {
        id: 'phone',
        header: 'Teléfono',
        cell: c => c.phone ?? '—',
      },
      {
        id: 'createdAt',
        header: 'Cliente desde',
        cell: c => (
          <GenericText variant="body">{formatCustomerSince(c.createdAt)}</GenericText>
        ),
      },
      {
        id: 'debtUsd',
        header: 'Deuda USD',
        align: 'right',
        cell: c => (
          <GenericText
            variant="body"
            color={c.debtUsd > 0 ? 'orange.700' : 'gray.600'}
            fontWeight={c.debtUsd > 0 ? 'medium' : 'normal'}
          >
            {formatUsd(c.debtUsd)}
          </GenericText>
        ),
      },
      {
        id: 'debtBs',
        header: 'Deuda Bs',
        align: 'right',
        cell: c => (
          <GenericText
            variant="body"
            color={c.debtUsd > 0 ? 'orange.700' : 'gray.600'}
            fontWeight={c.debtUsd > 0 ? 'medium' : 'normal'}
          >
            {formatBs(c.debtBs)}
          </GenericText>
        ),
      },
    ];
  }, []);

  const openCustomer = (c: Customer) => nav(`/accounting/customers/${c.id}`);

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
        <Flex align="center" gap={2}>
          <BackChevronLink to="/accounting" aria-label="Volver a contabilidad" />
          <GenericHeading flex="1" minW={0}>
            Clientes
          </GenericHeading>
          <Button size="sm" colorPalette="green" flexShrink={0} onClick={() => setCreateOpen(true)}>
            Nuevo
          </Button>
        </Flex>
      </Box>

      <Box
        flexShrink={0}
        px={3}
        py={2}
        bg="gray.50"
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <GenericSearchInput
          placeholder="Buscar por nombre"
          value={search}
          onChange={setSearch}
          size="lg"
          h="12"
          boxShadow="sm"
        />
      </Box>

      <Box flex="1" minH={0} h={0} overflowY="auto" overscrollBehavior="contain" px={3} py={3} pb={4}>
        <Stack gap={2} display={{ base: 'flex', md: 'none' }}>
          {customers.map(c => (
            <CustomerListCard key={c.id} customer={c} onOpen={() => openCustomer(c)} />
          ))}
        </Stack>

        <Box display={{ base: 'none', md: 'block' }}>
          <GenericDataTable
            columns={columns}
            rows={customers}
            getRowKey={c => c.id}
            emptyMessage="No hay clientes. Prueba otra búsqueda o crea uno nuevo."
            onRowClick={openCustomer}
          />
        </Box>

        {customers.length === 0 && (
          <GenericText variant="muted" textAlign="center" py={8} display={{ base: 'block', md: 'none' }}>
            No hay clientes. Prueba otra búsqueda o crea uno nuevo.
          </GenericText>
        )}
      </Box>

      <CustomerQuickCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => setCreateOpen(false)}
      />
    </Flex>
  );
}
