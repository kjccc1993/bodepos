import { Badge, Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { NavIcon, type NavIconId } from '@/components/nav/NavIcons';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBcvRateSync } from '@/lib/api/hooks';
import { isOnline } from '@/lib/offline/sync';
import { useEffect, useState } from 'react';

const tabs: { to: string; label: string; mobileLabel: string; icon: NavIconId }[] = [
  { to: '/sell', label: 'Vender', mobileLabel: 'Vender', icon: 'sell' },
  { to: '/products', label: 'Productos', mobileLabel: 'Productos', icon: 'products' },
  { to: '/accounting', label: 'Contabilidad', mobileLabel: 'Contabilidad', icon: 'accounting' },
];

function isTabActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <Flex
      as="nav"
      aria-label="Menú inferior"
      display={{ base: 'flex', lg: 'none' }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTopWidth="1px"
      borderColor="gray.200"
      boxShadow="none"
      zIndex={10}
      px={1}
      pt={1}
      pb="max(0.35rem, env(safe-area-inset-bottom))"
      justify="space-between"
      gap={0.5}
    >
      {tabs.map(tab => {
        const active = isTabActive(pathname, tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
            aria-current={active ? 'page' : undefined}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap={0.5}
              minH="14"
              py={1}
              px={0.5}
              borderRadius="lg"
              bg={active ? 'green.50' : 'transparent'}
              color={active ? 'green.700' : 'gray.600'}
              transition="background 0.15s ease"
              _active={{ bg: 'gray.100' }}
            >
              <Box lineHeight={0}>
                <NavIcon id={tab.icon} active={active} />
              </Box>
              <Text
                fontSize="2xs"
                fontWeight={active ? 'bold' : 'medium'}
                lineHeight="1.1"
                textAlign="center"
                lineClamp={1}
                w="full"
              >
                {tab.mobileLabel}
              </Text>
            </Flex>
          </Link>
        );
      })}
    </Flex>
  );
}

export function PosShell() {
  const loc = useLocation();
  const { logout } = useAuth();
  const [online, setOnline] = useState(isOnline());
  useBcvRateSync();

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return (
    <Flex h="100dvh" maxH="100dvh" overflow="hidden" direction={{ base: 'column', lg: 'row' }}>
      <Box
        as="nav"
        aria-label="Menú principal"
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        w="56"
        flexShrink={0}
        bg="white"
        borderRightWidth="1px"
        borderColor="gray.200"
        position="sticky"
        top={0}
        h="100dvh"
        py={5}
        px={3}
      >
        <Box px={1} mb={6}>
          <BrandLogo size="sm" />
        </Box>

        <Stack gap={1} flex="1">
          {tabs.map(tab => {
            const active = isTabActive(loc.pathname, tab.to);
            return (
              <Link key={tab.to} to={tab.to} style={{ textDecoration: 'none' }}>
                <Flex
                  align="center"
                  gap={2}
                  px={3}
                  py={2.5}
                  borderRadius="md"
                  bg={active ? 'green.50' : 'transparent'}
                  color={active ? 'green.800' : 'gray.700'}
                  fontWeight={active ? 'semibold' : 'medium'}
                  fontSize="sm"
                  borderWidth="1px"
                  borderColor={active ? 'green.200' : 'transparent'}
                  _hover={{ bg: active ? 'green.50' : 'gray.50' }}
                >
                  <Box flexShrink={0} lineHeight={0}>
                    <NavIcon id={tab.icon} active={active} />
                  </Box>
                  {tab.label}
                </Flex>
              </Link>
            );
          })}
        </Stack>

        <Stack gap={2} mt="auto">
          {!online && (
            <Badge colorPalette="orange" size="sm" justifyContent="center" py={1}>
              Sin conexión
            </Badge>
          )}
          <Button variant="ghost" size="sm" color="gray.600" onClick={logout}>
            Cerrar sesión
          </Button>
          <Text fontSize="2xs" color="gray.400" px={2}>
            v0.1.0
          </Text>
        </Stack>
      </Box>

      <Flex
        direction="column"
        flex="1"
        minW={0}
        minH={0}
        overflow="hidden"
        bg={{ base: 'white', lg: 'transparent' }}
      >
        {!online && (
          <Badge
            colorPalette="orange"
            justifyContent="center"
            py={1}
            borderRadius={0}
            display={{ base: 'flex', lg: 'none' }}
            flexShrink={0}
          >
            Sin conexión — operando con datos locales
          </Badge>
        )}
        <Box
          as="main"
          flex="1"
          minH={0}
          minW={0}
          display="flex"
          flexDirection="column"
          overflowY="auto"
          overflowX="hidden"
          px={{ base: 3, lg: 5 }}
          pt={{ base: 3, lg: 4 }}
          pb={{
            base: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
            lg: 4,
          }}
        >
          <Outlet />
        </Box>

        <BottomNav pathname={loc.pathname} />
      </Flex>
    </Flex>
  );
}
