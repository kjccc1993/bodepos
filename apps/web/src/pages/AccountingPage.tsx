import { Box, Button, Flex, Link as RLink, Stack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { GenericHeading } from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';

const links = [
  { to: '/accounting/invoices', label: 'Facturas de ventas' },
  { to: '/accounting/daily-incomes', label: 'Ingresos diarios' },
  { to: '/accounting/customers', label: 'Clientes (CxC)' },
];

export function AccountingPage() {
  const { logout } = useAuth();

  return (
    <Flex direction="column" flex="1" minH={0} w="full">
      <Stack gap={2} flex="1" minH={0} overflowY="auto">
        <GenericHeading variant="page" fontSize="xl">
          Contabilidad
        </GenericHeading>
        {links.map(l => (
          <RLink asChild key={l.to}>
            <Link
              to={l.to}
              style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}
            >
              {l.label}
            </Link>
          </RLink>
        ))}
      </Stack>

      <Box flexShrink={0} display={{ base: 'block', lg: 'none' }} pt={3} mt="auto">
        <Button w="full" size="md" colorPalette="red" variant="subtle" onClick={logout}>
          Cerrar sesión
        </Button>
      </Box>
    </Flex>
  );
}
