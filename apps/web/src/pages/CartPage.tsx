import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CartCheckoutPanel } from '@/components/cart/CartCheckoutPanel';
import { CartLineCard } from '@/components/cart/CartLineCard';
import { PosClientHeader } from '@/components/sell/PosClientHeader';
import { GenericText } from '@/components/ui';
import { useCart } from '@/lib/cart/CartContext';
import { lineTotalUsd } from '@/lib/cart/quantity';
import { usdToBs } from '@/lib/money';
import { useProducts, useStoreSettings } from '@/lib/api/hooks';
import { effectiveRate } from '@/lib/rate';

export function CartPage() {
  const { lines, updateQty, removeLine, clearCart, activeSlot, setActiveSlot, itemCount } = useCart();
  const { data: settings } = useStoreSettings();
  const rate = effectiveRate(settings);
  const { data: catalog = [] } = useProducts('');

  const stockById = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of catalog) map.set(p.id, p.stock);
    return map;
  }, [catalog]);

  const totalUsd = lines.reduce((a, l) => a + lineTotalUsd(l), 0);
  const totalBs = usdToBs(totalUsd, rate);

  return (
    <Flex
      direction="column"
      flex="1"
      minH={0}
      h={0}
      mx={{ base: -3, lg: -5 }}
      mt={{ base: -3, lg: -4 }}
      mb={{ base: -3, lg: -4 }}
    >
      <PosClientHeader
        title="Completar compra"
        itemCount={itemCount}
        activeSlot={activeSlot}
        onSlotChange={setActiveSlot}
      />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        flex="1"
        minH={0}
        h={0}
        align="stretch"
      >
        <Box
          flex={{ base: '1', md: '2' }}
          minW={0}
          minH={0}
          overflowY="auto"
          overscrollBehavior="contain"
          px={3}
          py={3}
        >
          {lines.length === 0 ? (
            <StackEmpty />
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

        {lines.length > 0 && (
          <CartCheckoutPanel totalUsd={totalUsd} totalBs={totalBs} onClear={clearCart} />
        )}
      </Flex>
    </Flex>
  );
}

function StackEmpty() {
  return (
    <Flex direction="column" align="center" justify="center" py={12} px={4} gap={3}>
      <GenericText variant="muted" textAlign="center">
        No hay nada en este carrito.
      </GenericText>
      <Link to="/sell">
        <Button colorPalette="green" variant="outline">
          Volver a vender
        </Button>
      </Link>
    </Flex>
  );
}
