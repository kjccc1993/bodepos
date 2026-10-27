import { Badge, Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { startTransition } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { NavIcon, type NavIconId } from '@/components/nav/NavIcons';
import { SidebarAccountingNav } from '@/components/nav/SidebarAccountingNav';
import { SidebarUserBlock } from '@/components/nav/SidebarUserBlock';
import { isAccountingNavLinkActive, isAccountingPath } from '@/lib/nav/accounting-nav';
import { useLogout } from '@/lib/auth/useLogout';
import { useBcvRateSync, useCatalogBackgroundSync } from '@/lib/api/hooks';
import { navItemActiveProps, navItemIdleProps, sidebarChromeProps } from '@/lib/design/surface-styles';
import { isOnline } from '@/lib/offline/sync';
import { useEffect, useState } from 'react';

const tabs: { to: string; label: string; mobileLabel: string; icon: NavIconId }[] = [
  { to: '/sell', label: 'Vender', mobileLabel: 'Vender', icon: 'sell' },
  { to: '/products', label: 'Productos', mobileLabel: 'Productos', icon: 'products' },
  { to: '/accounting', label: 'Contabilidad', mobileLabel: 'Contabilidad', icon: 'accounting' },
];

const mobileBottomTabs: { to: string; label: string; icon: NavIconId }[] = [
  { to: '/sell', label: 'Vender', icon: 'sell' },
  { to: '/products', label: 'Productos', icon: 'products' },
  { to: '/accounting/invoices', label: 'Facturas', icon: 'invoices' },
  { to: '/accounting/daily-incomes', label: 'Ingresos', icon: 'dailyIncomes' },
  { to: '/accounting/customers', label: 'Clientes', icon: 'customers' },
];

const MOBILE_NAV_BRAND = '#FF782D';

function isTabActive(pathname: string, to: string) {
  if (to === '/accounting') return isAccountingPath(pathname);
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isMobileBottomTabActive(pathname: string, to: string) {
  if (to.startsWith('/accounting')) return isAccountingNavLinkActive(pathname, to);
  return pathname === to || pathname.startsWith(`${to}/`);
}

function BottomNav({ pathname }: { pathname: string }) {
  const navigate = useNavigate();

  return (
    <Box
      as="nav"
      aria-label="Menú inferior"
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={10}
      px={3}
      pb="max(0.75rem, env(safe-area-inset-bottom))"
      pointerEvents="none"
    >
      <Flex
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="lift"
        px={1}
        py={1.5}
        justify="space-between"
        gap={0}
        pointerEvents="auto"
      >
        {mobileBottomTabs.map(tab => {
          const active = isMobileBottomTabActive(pathname, tab.to);
          return (
            <Box key={tab.to} position="relative" flex={1} minW={0}>
              {active && (
                <Box
                  position="absolute"
                  top={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="7"
                  h="0.5"
                  borderRadius="full"
                  bg="brand.500"
                  zIndex={1}
                  aria-hidden
                />
              )}
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (active) return;
                  startTransition(() => navigate(tab.to));
                }}
                style={{
                  width: '100%',
                  minWidth: 0,
                  border: 0,
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  gap={0.5}
                  minH="12"
                  py={1}
                  px={0.5}
                  w="full"
                  color={active ? 'brand.600' : 'gray.500'}
                  transition="color 0.15s ease"
                  _active={{ opacity: 0.85 }}
                >
                  <Box lineHeight={0}>
                    <NavIcon id={tab.icon} active={active} activeColor={MOBILE_NAV_BRAND} />
                  </Box>
                  <Text
                    fontSize="2xs"
                    fontWeight={active ? 'bold' : 'medium'}
                    lineHeight="1.1"
                    textAlign="center"
                    lineClamp={1}
                    w="full"
                  >
                    {tab.label}
                  </Text>
                </Flex>
              </button>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}

export function PosShell() {
  const loc = useLocation();
  const isTradeView = loc.pathname === '/sell' || loc.pathname === '/products';
  const logout = useLogout();
  const [online, setOnline] = useState(isOnline());
  useBcvRateSync();
  const [deferHeavySync, setDeferHeavySync] = useState(false);
  useCatalogBackgroundSync(deferHeavySync);

  useEffect(() => {
    const id = window.setTimeout(() => setDeferHeavySync(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

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
        w="64"
        flexShrink={0}
        {...sidebarChromeProps}
        position="sticky"
        top={0}
        h="100dvh"
        py={6}
        px={5}
      >
        <Box px={0.5} pb={5} mb={5} borderBottomWidth="1px" borderColor="gray.200">
          <BrandLogo size="sm" />
        </Box>

        <Box mb={6}>
          <SidebarUserBlock />
        </Box>

        <Stack gap={2.5} flex="1">
          {tabs.map(tab => {
            if (tab.to === '/accounting') {
              return <SidebarAccountingNav key={tab.to} pathname={loc.pathname} />;
            }
            const active = isTabActive(loc.pathname, tab.to);
            return (
              <Link key={tab.to} to={tab.to} style={{ textDecoration: 'none' }}>
                <Flex
                  align="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  fontSize="sm"
                  lineHeight="short"
                  transition="background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease"
                  {...(active ? navItemActiveProps : navItemIdleProps)}
                  _hover={{
                    bg: active ? 'white' : 'blackAlpha.50',
                    borderColor: active ? 'gray.200' : 'transparent',
                  }}
                >
                  <Box flexShrink={0} lineHeight={0} w="6" display="flex" justifyContent="center">
                    <NavIcon id={tab.icon} active={active} />
                  </Box>
                  {tab.label}
                </Flex>
              </Link>
            );
          })}
        </Stack>

        <Stack gap={2.5} mt="auto" pt={4}>
          {!online && (
            <Badge colorPalette="orange" size="sm" justifyContent="center" py={1} borderRadius="md">
              Sin conexión
            </Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="md"
            w="full"
            h="10"
            borderRadius="lg"
            borderColor="gray.200"
            color="gray.700"
            fontWeight="medium"
            bg="white"
            boxShadow="0 1px 2px rgba(15, 23, 42, 0.04)"
            _hover={{ bg: 'gray.50' }}
            onClick={logout}
          >
            Cerrar sesión
          </Button>
          <Text fontSize="2xs" color="gray.400" px={1} textAlign="center">
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
        bg={{ base: 'surface.page', lg: 'surface.page' }}
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
          overflowY={isTradeView ? 'hidden' : 'auto'}
          overflowX="hidden"
          px={isTradeView ? 0 : { base: 3, lg: 5 }}
          pt={isTradeView ? 0 : { base: 3, lg: 4 }}
          pb={
            isTradeView
              ? {
                  base: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
                  lg: 0,
                }
              : {
                  base: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
                  lg: 4,
                }
          }
        >
          <Outlet />
        </Box>

        <BottomNav pathname={loc.pathname} />
      </Flex>
    </Flex>
  );
}
