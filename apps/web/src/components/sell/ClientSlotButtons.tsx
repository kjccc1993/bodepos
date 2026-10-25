import { Button, Flex } from '@chakra-ui/react';
import type { CartSlot } from '@/lib/cart/CartContext';

const SLOTS: CartSlot[] = [1, 2, 3];

type Props = {
  activeSlot: CartSlot;
  onSlotChange: (slot: CartSlot) => void;
};

/** Tres clientes en fila; usar dentro del mismo ancho que el buscador (`w="full"` del contenedor). */
export function ClientSlotButtons({ activeSlot, onSlotChange }: Props) {
  return (
    <Flex gap={1.5} w="full" maxW="full">
      {SLOTS.map(s => (
        <Button
          key={s}
          flex="1"
          minW={0}
          size="md"
          h="10"
          px={2}
          borderRadius="md"
          variant={activeSlot === s ? 'solid' : 'outline'}
          colorPalette={activeSlot === s ? 'green' : 'gray'}
          borderColor={activeSlot === s ? 'green.500' : 'gray.200'}
          onClick={() => onSlotChange(s)}
        >
          Cliente {s}
        </Button>
      ))}
    </Flex>
  );
}
