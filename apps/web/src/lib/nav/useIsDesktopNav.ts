import { useBreakpointValue } from '@chakra-ui/react';

/** Coincide con el sidenav visible (`lg` en PosShell). */
export function useIsDesktopNav() {
  return useBreakpointValue({ base: false, lg: true }) ?? false;
}
