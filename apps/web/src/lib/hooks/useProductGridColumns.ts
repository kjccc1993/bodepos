import { useBreakpointValue } from '@chakra-ui/react';

export function useProductGridColumns(mode: 'sell' | 'admin') {
  const sellCols = useBreakpointValue({ base: 1, md: 2, xl: 3 }) ?? 1;
  const adminCols = useBreakpointValue({ base: 1, md: 3 }) ?? 1;
  const columnCount = mode === 'sell' ? sellCols : adminCols;
  const templateColumns =
    mode === 'sell'
      ? { base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }
      : { base: '1fr', md: 'repeat(3, minmax(0, 1fr))' };
  return { columnCount, templateColumns };
}
