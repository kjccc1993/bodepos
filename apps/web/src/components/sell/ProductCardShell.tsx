import { Badge, Box, Flex, Stack, type StackProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { GenericText } from '@/components/ui';
import { formatBs, formatUsd } from '@/lib/money';
import type { Product } from '@/lib/types';

export function productStockSuffix(unit: Product['unit']) {
  return unit === 'UNIT' ? 'uds' : unit === 'KG' ? 'kg' : 'g';
}

/** Ancho de la columna de acciones (stepper o botones), alineado con CompactQuantityField. */
export const productCardActionsWidth = { base: 'calc(6.5rem + 15px)', md: '7.25rem' } as const;

type Props = {
  product: Product;
  rate: number;
  highlight?: boolean;
  actions: ReactNode;
  /** Reemplaza el badge de stock (p. ej. eliminar en carrito). */
  headerTrailing?: ReactNode;
  /** Si se indica, muestra subtotal de línea en lugar del precio unitario. */
  lineTotalUsd?: number;
} & Pick<StackProps, 'h'>;

export function ProductCardShell({
  product,
  rate,
  highlight = false,
  actions,
  headerTrailing,
  lineTotalUsd,
  h,
}: Props) {
  const lowStock = product.stock <= 0;
  const stockSuffix = productStockSuffix(product.unit);
  const unitPriceBs = product.priceBs || product.priceUsd * rate;
  const displayUsd = lineTotalUsd ?? product.priceUsd;
  const displayBs =
    lineTotalUsd != null ? Math.round(lineTotalUsd * rate * 100) / 100 : unitPriceBs;
  const showUnitSuffix = lineTotalUsd == null && product.unit !== 'UNIT';

  return (
    <Stack
      gap={{ base: 1.5, md: 2 }}
      p={{ base: 2, md: 2.5 }}
      bg={highlight ? 'green.50' : 'white'}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={highlight ? 'green.200' : 'gray.200'}
      w="full"
      h={h ?? { base: 'auto', md: 'full' }}
      minW={0}
      boxShadow="sm"
    >
      <Flex
        align="start"
        justify="space-between"
        gap={1.5}
        minH={{ base: '2.5rem', md: '2.75rem' }}
        maxH={{ base: '2.5rem', md: '2.75rem' }}
        flexShrink={0}
        overflow="hidden"
      >
        <GenericText
          variant="strong"
          fontSize="sm"
          lineHeight="1.375"
          lineClamp={2}
          overflow="hidden"
          flex="1"
          minW={0}
          minH={0}
          title={product.name}
        >
          {product.name}
        </GenericText>
        {headerTrailing ?? (
          <Badge
            size="sm"
            variant="subtle"
            colorPalette={lowStock ? 'red' : 'gray'}
            fontWeight="normal"
            flexShrink={0}
            alignSelf="flex-start"
          >
            {product.stock} {stockSuffix}
          </Badge>
        )}
      </Flex>

      <Flex align="flex-end" justify="space-between" gap={{ base: 1, md: 2 }} mt={{ base: 0, md: 'auto' }}>
        <Box minW={0} flex="1" pe={{ base: 1, md: 2 }}>
          <GenericText variant="price" fontSize="sm">
            {formatUsd(displayUsd)}
            {showUnitSuffix && (
              <GenericText as="span" variant="caption" ml={0.5}>
                /kg
              </GenericText>
            )}
          </GenericText>
          <GenericText variant="micro">{formatBs(displayBs)}</GenericText>
        </Box>
        {actions}
      </Flex>
    </Stack>
  );
}
