import { Box, Flex, Stack } from '@chakra-ui/react';
import { useMemo } from 'react';
import { CartCheckoutPanel } from '@/components/cart/CartCheckoutPanel';
import { CartLineCard } from '@/components/cart/CartLineCard';
import { ClientSlotButtons } from '@/components/sell/ClientSlotButtons';
import { GenericHeading, GenericText } from '@/components/ui';
import { useCart, type CartSlot } from '@/lib/cart/CartContext';
import { lineTotalUsd } from '@/lib/cart/quantity';
import { usdToBs } from '@/lib/money';

type Props = {
  rate: number;
  stockById: Map<string, number>;
  activeSlot: CartSlot;
  onSlotChange: (slot: CartSlot) => void;
};

/** Panel de carrito / factura en armado (columna derecha en Vender desktop). */
export function SellInvoicePanel({ rate, stockById, activeSlot, onSlotChange }: Props) {
  const { lines, updateQty, removeLine, clearCart } = useCart();

  const totalUsd = useMemo(() => lines.reduce((a, l) => a + lineTotalUsd(l), 0), [lines]);
  const totalBs = usdToBs(totalUsd, rate);

  return (
    <Flex direction="column" flex="1" minH={0} minW={0} h="full">
      <Box flexShrink={0} px={3} pt={3} pb={3} borderBottomWidth="1px" borderColor="gray.200">
        <ClientSlotButtons activeSlot={activeSlot} onSlotChange={onSlotChange} />
        <Box mt={3} pt={3} borderTopWidth="1px" borderColor="gray.200">
          <GenericHeading variant="section">Factura</GenericHeading>
          <GenericText variant="caption" mt={0.5}>
            Cliente {activeSlot}
          </GenericText>
        </Box>
      </Box>

      <Box flex="1" minH={0} overflowY="auto" overscrollBehavior="contain" px={3} py={3}>
        {lines.length === 0 ? (
          <GenericText variant="muted" textAlign="center" py={8} px={2}>
            Agrega productos desde el catálogo de la izquierda.
          </GenericText>
        ) : (
          <Stack gap={2} w="full">
            {lines.map(line => (
              <CartLineCard
                key={line.productId}
                line={line}
                rate={rate}
                stock={stockById.get(line.productId) ?? 0}
                onRemove={() => removeLine(line.productId)}
                onUpdateQty={q => updateQty(line.productId, q)}
              />
            ))}
          </Stack>
        )}
      </Box>

      <CartCheckoutPanel
        variant="sidebar"
        totalUsd={totalUsd}
        totalBs={totalBs}
        onClear={clearCart}
        payDisabled={lines.length === 0}
      />
    </Flex>
  );
}
