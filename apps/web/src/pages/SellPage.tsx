import { Box, Flex, Grid } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { SellInvoicePanel } from '@/components/cart/SellInvoicePanel';
import { CompactQuantityField } from '@/components/sell/CompactQuantityField';
import { PosClientHeader } from '@/components/sell/PosClientHeader';
import { ProductCardShell } from '@/components/sell/ProductCardShell';
import { GenericInput, GenericText } from '@/components/ui';
import { useBarcodeScanner } from '@/lib/barcode/useBarcodeScanner';
import { parseQuantityInput } from '@/lib/cart/quantity';
import { useCart } from '@/lib/cart/CartContext';
import { useProducts, useStoreSettings } from '@/lib/api/hooks';
import { effectiveRate } from '@/lib/rate';
import type { Product } from '@/lib/types';

export function SellPage() {
  const { data: settings } = useStoreSettings();
  const rate = effectiveRate(settings);
  const [search, setSearch] = useState('');
  const { data: products = [] } = useProducts(search);
  const { data: catalog = [] } = useProducts('');
  const { activeSlot, setActiveSlot, lines, setProductQuantity, itemCount } = useCart();

  const stockById = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of catalog) map.set(p.id, p.stock);
    return map;
  }, [catalog]);

  const qtyByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of lines) map.set(l.productId, l.quantity);
    return map;
  }, [lines]);

  const syncQuantity = useCallback(
    (p: Product, raw: string) => {
      const quantity = parseQuantityInput(raw, p.unit);
      setProductQuantity(
        {
          productId: p.id,
          productName: p.name,
          unit: p.unit,
          unitPriceUsd: p.priceUsd,
        },
        quantity,
      );
    },
    [setProductQuantity],
  );

  const onScan = useCallback(
    (code: string) => {
      const p = products.find(x => x.barcode === code);
      if (!p) {
        setSearch(code);
        return;
      }
      const current = qtyByProductId.get(p.id) ?? 0;
      const step = p.unit === 'UNIT' ? 1 : 100;
      syncQuantity(p, String(current + step));
    },
    [products, qtyByProductId, syncQuantity],
  );

  useBarcodeScanner(onScan);

  const productGrid = (
    <Grid
      key={`sell-grid-${activeSlot}`}
      templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
      gap={{ base: 2, md: 3 }}
      w="full"
      alignItems="start"
    >
      {products.map(p => (
        <ProductRow
          key={p.id}
          product={p}
          rate={rate}
          quantity={qtyByProductId.get(p.id) ?? 0}
          onQuantityChange={raw => syncQuantity(p, raw)}
          onStep={delta => {
            const current = qtyByProductId.get(p.id) ?? 0;
            const step = p.unit === 'UNIT' ? delta : delta * 100;
            const next = Math.max(0, current + step);
            syncQuantity(p, next > 0 ? String(next) : '');
          }}
        />
      ))}
    </Grid>
  );

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
        title="Vender"
        itemCount={itemCount}
        activeSlot={activeSlot}
        onSlotChange={setActiveSlot}
        hideCartIconFromMd
      />

      <Flex direction={{ base: 'column', md: 'row' }} flex="1" minH={0} h={0} align="stretch">
        <Flex direction="column" flex={{ base: '1', md: '2' }} minW={0} minH={0}>
          <Box
            flexShrink={0}
            px={3}
            py={2}
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.200"
          >
            <GenericInput
              placeholder="Buscar o escanear código"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="lg"
              h="12"
              boxShadow="sm"
            />
          </Box>

          <Box flex="1" minH={0} h={0} overflowY="auto" overscrollBehavior="contain" px={3} py={3} pb={4}>
            {productGrid}
            {products.length === 0 && (
              <GenericText variant="muted" textAlign="center" py={8}>
                No hay productos. Prueba otra búsqueda.
              </GenericText>
            )}
          </Box>
        </Flex>

        <Box
          flex={{ md: '1' }}
          minH={0}
          borderLeftWidth={{ md: '1px' }}
          borderColor="gray.200"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
        >
          <SellInvoicePanel rate={rate} stockById={stockById} />
        </Box>
      </Flex>
    </Flex>
  );
}

function ProductRow({
  product,
  rate,
  quantity,
  onQuantityChange,
  onStep,
}: {
  product: Product;
  rate: number;
  quantity: number;
  onQuantityChange: (raw: string) => void;
  onStep: (delta: number) => void;
}) {
  const inCart = quantity > 0;

  return (
    <ProductCardShell
      product={product}
      rate={rate}
      highlight={inCart}
      actions={
        <CompactQuantityField
          unit={product.unit}
          quantity={quantity}
          inCart={inCart}
          onQuantityChange={onQuantityChange}
          onStep={onStep}
          hideLabel
        />
      }
    />
  );
}
