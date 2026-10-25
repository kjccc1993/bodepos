import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerQuickCreateDialog } from '@/components/customers/CustomerQuickCreateDialog';
import { CustomerListCard } from '@/components/customers/CustomerListCard';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import { GenericHeading, GenericSearchInput, GenericText } from '@/components/ui';
import { useCustomers } from '@/lib/api/hooks';

export function CustomersPage() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { data: customers = [] } = useCustomers(search);

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
        <Stack gap={2}>
          {customers.map(c => (
            <CustomerListCard
              key={c.id}
              customer={c}
              onOpen={() => nav(`/accounting/customers/${c.id}`)}
            />
          ))}
        </Stack>
        {customers.length === 0 && (
          <GenericText variant="muted" textAlign="center" py={8}>
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
