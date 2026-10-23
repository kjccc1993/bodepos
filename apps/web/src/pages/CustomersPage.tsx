import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GenericHeading, GenericInput, GenericText } from '@/components/ui';
import { useCustomers, useSaveCustomer } from '@/lib/api/hooks';
import { formatUsd } from '@/lib/money';
import { apiFetch } from '@/lib/http/client';

export function CustomersPage() {
  const { data: customers = [], refetch } = useCustomers();
  const save = useSaveCustomer();
  const [name, setName] = useState('');
  const [showNew, setShowNew] = useState(false);

  return (
    <Stack gap={3} flex="1" minH={0} h={0} overflowY="auto">
      <Flex align="center" gap={2}>
        <Link to="/accounting">←</Link>
        <GenericHeading>Clientes</GenericHeading>
      </Flex>
      <Button colorPalette="green" onClick={() => setShowNew(true)}>
        Nuevo cliente
      </Button>
      {showNew && (
        <Flex gap={2}>
          <GenericInput placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} flex="1" />
          <Button
            onClick={async () => {
              await save.mutateAsync({ name });
              setName('');
              setShowNew(false);
            }}
          >
            Guardar
          </Button>
        </Flex>
      )}
      {customers.map(c => (
        <Box key={c.id} bg="white" p={3} borderRadius="md" borderWidth="1px">
          <Flex justify="space-between">
            <GenericText variant="strong">{c.name}</GenericText>
            <GenericText variant="body">
              {formatUsd(c.debtUsd)} / Bs {c.debtBs.toLocaleString('es-VE')}
            </GenericText>
          </Flex>
          <Button
            size="xs"
            mt={2}
            variant="outline"
            onClick={async () => {
              const raw = prompt('Abono en USD', '1');
              if (!raw) return;
              await apiFetch(`/customers/${c.id}/payments`, {
                method: 'POST',
                body: JSON.stringify({ amountUsd: Number(raw), method: 'efectivo' }),
              });
              void refetch();
            }}
          >
            Registrar abono
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
