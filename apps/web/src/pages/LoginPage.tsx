import { Box, Button, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GenericHeading, GenericInput, GenericText } from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('admin@bode.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('sesion') === 'expirada') {
      setError('Tu sesión expiró. Inicia sesión de nuevo para guardar cambios.');
    }
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      const next = searchParams.get('next');
      nav(next && next.startsWith('/') ? next : '/sell');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlexCenter>
      <Box as="form" onSubmit={onSubmit} w="full" maxW="md" p={6} bg="white" borderRadius="lg" shadow="md">
        <GenericHeading variant="hero" mb={2}>
          BodePOS
        </GenericHeading>
        <GenericText variant="muted" mb={4}>
          Punto de venta para bodegas
        </GenericText>
        <Stack gap={3}>
          <GenericInput placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <GenericInput
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
          />
          {error && <GenericText variant="error">{error}</GenericText>}
          <Button type="submit" colorPalette="green" loading={loading}>
            Entrar
          </Button>
        </Stack>
      </Box>
    </FlexCenter>
  );
}

function FlexCenter({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" display="flex" alignItems="center" justifyContent="center" px={4} bg="gray.50">
      {children}
    </Box>
  );
}
