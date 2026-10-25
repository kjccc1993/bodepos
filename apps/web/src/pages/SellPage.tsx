import { Box, Flex } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { SellInvoicePanel } from '@/components/cart/SellInvoicePanel';
import { ClientSlotButtons } from '@/components/sell/ClientSlotButtons';
import { PosClientHeader } from '@/components/sell/PosClientHeader';
import { SellCatalogGrid } from '@/components/sell/SellCatalogGrid';
import { GenericSearchInput, GenericText } from '@/components/ui';
import { sellWorkspacePanelProps } from '@/lib/design/surface-styles';
import { useProductStockMap, useStoreSettings } from '@/lib/api/hooks';
import { useBarcodeScanner } from '@/lib/barcode/useBarcodeScanner';
import { parseQuantityInput } from '@/lib/cart/quantity';
import { useCart } from '@/lib/cart/CartContext';
import { useInfiniteProductList } from '@/lib/hooks/useInfiniteProductList';
import { apiFetch } from '@/lib/http/client';
import { effectiveRate } from '@/lib/rate';
import { useSellTabActive } from '@/lib/trade/TradeTabContext';
import type { Product } from '@/lib/types';

export function SellPage() {
  const { data: settings } = useStoreSettings();
  const rate = effectiveRate(settings);
  const [search, setSearch] = useState('');
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const { products, sentinelRef, isLoading, isFetchingNextPage } = useInfiniteProductList(search);
  const { data: stockById = new Map<string, number>() } = useProductStockMap();
  const { activeSlot, setActiveSlot, lines, setProductQuantity, itemCount } = useCart();
  const sellTabActive = useSellTabActive();

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

  const onQuantityChange = useCallback(
    (p: Product, raw: string) => syncQuantity(p, raw),
    [syncQuantity],
  );

  const onStep = useCallback(
    (p: Product, delta: number) => {
      const current = qtyByProductId.get(p.id) ?? 0;
      const step = p.unit === 'UNIT' ? delta : delta * 100;
      const next = Math.max(0, current + step);
      syncQuantity(p, next > 0 ? String(next) : '');
    },
    [qtyByProductId, syncQuantity],
  );

  const onScan = useCallback(
    (code: string) => {
      void (async () => {
        let p = products.find(x => x.barcode === code);
        if (!p) {
          try {
            p = await apiFetch<Product>(`/products/by-barcode/${encodeURIComponent(code)}`);
          } catch {
            setSearch(code);
            return;
          }
        }
        const current = qtyByProductId.get(p.id) ?? 0;
        const step = p.unit === 'UNIT' ? 1 : 100;
        syncQuantity(p, String(current + step));
      })();
    },
    [products, qtyByProductId, syncQuantity],
  );

  useBarcodeScanner(onScan, sellTabActive);

  const showEmpty = !isLoading && products.length === 0;

  return (
    <Flex direction="column" flex="1" minH={0} h={0} w="full">
      <PosClientHeader title="Vender" itemCount={itemCount} hideCartIconFromMd />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        flex="1"
        minH={0}
        h={0}
        align="stretch"
        gap={{ md: 4 }}
        p={{ md: 4 }}
        bg="surface.page"
      >
        <Flex {...sellWorkspacePanelProps} flex={{ base: '1', md: '2' }} order={{ md: 1 }}>
          <Box flexShrink={0} px={3} py={3} borderBottomWidth="1px" borderColor="gray.200">
            <Box display={{ base: 'block', md: 'none' }} mb={2}>
              <ClientSlotButtons activeSlot={activeSlot} onSlotChange={setActiveSlot} />
            </Box>
            <GenericSearchInput
              placeholder="Buscar o escanear código"
              value={search}
              onChange={setSearch}
              size="lg"
              h="12"
              boxShadow="card"
            />
          </Box>

          <Box
            ref={setScrollRoot}
            data-product-scroll-root
            flex="1"
            minH={0}
            overflowY="auto"
            overscrollBehavior="contain"
            px={3}
            py={3}
            pb={4}
          >
            <SellCatalogGrid
              products={products}
              rate={rate}
              activeSlot={activeSlot}
              scrollRoot={scrollRoot}
              qtyByProductId={qtyByProductId}
              onQuantityChange={onQuantityChange}
              onStep={onStep}
            />

            {isLoading && (
              <GenericText variant="muted" textAlign="center" py={6}>
                Cargando productos…
              </GenericText>
            )}
            {showEmpty && (
              <GenericText variant="muted" textAlign="center" py={8}>
                No hay productos. Prueba otra búsqueda.
              </GenericText>
            )}
            <Box ref={sentinelRef} h="1" w="full" flexShrink={0} aria-hidden />
            {isFetchingNextPage && (
              <GenericText variant="caption" textAlign="center" py={3}>
                Cargando más…
              </GenericText>
            )}
          </Box>
        </Flex>

        <Flex
          {...sellWorkspacePanelProps}
          flex={{ md: '1' }}
          display={{ base: 'none', md: 'flex' }}
          order={{ md: 2 }}
        >
          <SellInvoicePanel
            rate={rate}
            stockById={stockById}
            activeSlot={activeSlot}
            onSlotChange={setActiveSlot}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
