import { Box, Button, Flex } from '@chakra-ui/react';
import { CartHeaderIcon } from '@/components/nav/CartHeaderIcon';
import { RateBadgeWithSettings } from '@/components/rate/RateBadgeWithSettings';
import { GenericHeading } from '@/components/ui';
import type { CartSlot } from '@/lib/cart/CartContext';

const SLOTS: CartSlot[] = [1, 2, 3];

type Props = {
  title: string;
  itemCount: number;
  activeSlot: CartSlot;
  onSlotChange: (slot: CartSlot) => void;
  /** Oculta el acceso al carrito desde md (p. ej. factura en pantalla en Vender). */
  hideCartIconFromMd?: boolean;
};

export function PosClientHeader({
  title,
  itemCount,
  activeSlot,
  onSlotChange,
  hideCartIconFromMd = false,
}: Props) {
  return (
    <Box flexShrink={0} px={3} pt={3} pb={2} bg="white" borderBottomWidth="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" gap={2} mb={2}>
        <GenericHeading>{title}</GenericHeading>
        <Flex gap={1.5} align="center" flexShrink={0}>
          <RateBadgeWithSettings />
          <Box display={hideCartIconFromMd ? { base: 'block', md: 'none' } : 'block'}>
            <CartHeaderIcon itemCount={itemCount} />
          </Box>
        </Flex>
      </Flex>

      <Flex gap={1.5} w="full">
        {SLOTS.map(s => (
          <Button
            key={s}
            flex="1"
            size="md"
            h="10"
            borderRadius="md"
            variant={activeSlot === s ? 'solid' : 'outline'}
            colorPalette={activeSlot === s ? 'green' : 'gray'}
            onClick={() => onSlotChange(s)}
          >
            Cliente {s}
          </Button>
        ))}
      </Flex>
    </Box>
  );
}
