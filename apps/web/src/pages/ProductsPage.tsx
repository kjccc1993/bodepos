import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useCallback, useId, useState } from 'react';
import { AdminCatalogGrid } from '@/components/products/AdminCatalogGrid';
import { InventoryAdjustDialog } from '@/components/products/InventoryAdjustDialog';
import { FormField, GenericHeading, GenericInput, GenericSearchInput, GenericSelect, GenericText, type SelectOption } from '@/components/ui';
import { useSaveProduct, useStoreSettings } from '@/lib/api/hooks';
import { useInfiniteProductList } from '@/lib/hooks/useInfiniteProductList';
import { useQueryClient } from '@tanstack/react-query';
import { effectiveRate } from '@/lib/rate';
import type { Product, ProductUnit } from '@/lib/types';
import { apiFetch } from '@/lib/http/client';

const UNIT_OPTIONS: SelectOption[] = [
  { value: 'UNIT', label: 'Unidad' },
  { value: 'GRAM', label: 'Gramos' },
];

export function ProductsPage() {
  const { data: settings } = useStoreSettings();
  const rate = effectiveRate(settings);
  const [search, setSearch] = useState('');
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const [form, setForm] = useState<Partial<Product> | null>(null);
  const [inventoryProduct, setInventoryProduct] = useState<Product | null>(null);
  const [inventoryBusy, setInventoryBusy] = useState(false);
  const { products, sentinelRef, isLoading, isFetchingNextPage } = useInfiniteProductList(search);
  const onEdit = useCallback((p: Product) => setForm(p), []);
  const onInventory = useCallback((p: Product) => setInventoryProduct(p), []);
  const save = useSaveProduct();
  const qc = useQueryClient();

  const unitValue = form?.unit ?? 'UNIT';
  const fieldIds = {
    name: useId(),
    price: useId(),
    cost: useId(),
    barcode: useId(),
    unit: useId(),
  };

  return (
    <Flex direction="column" flex="1" minH={0} h={0} w="full">
      <Box flexShrink={0} px={3} pt={3} pb={2} bg="white" borderBottomWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" gap={2}>
          <GenericHeading>Mis productos</GenericHeading>
          <Button
            size="sm"
            colorPalette="green"
            flexShrink={0}
            onClick={() => setForm({ name: '', priceUsd: 1, costUsd: 0, unit: 'UNIT' })}
          >
            Nuevo
          </Button>
        </Flex>
      </Box>

      <Box
        flexShrink={0}
        px={3}
        py={2}
        bg="gray.50"
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <GenericSearchInput
          placeholder="Buscar por nombre"
          value={search}
          onChange={setSearch}
          size="lg"
          h="12"
          boxShadow="sm"
        />
      </Box>

      <Box
        ref={setScrollRoot}
        data-product-scroll-root
        flex="1"
        minH={0}
        h={0}
        overflowY="auto"
        overscrollBehavior="contain"
        px={3}
        py={3}
        pb={4}
      >
        <AdminCatalogGrid
          products={products}
          rate={rate}
          scrollRoot={scrollRoot}
          onEdit={onEdit}
          onInventory={onInventory}
        />
        {isLoading && (
          <GenericText variant="muted" textAlign="center" py={6}>
            Cargando productos…
          </GenericText>
        )}
        {!isLoading && products.length === 0 && (
          <GenericText variant="muted" textAlign="center" py={8}>
            No hay productos. Prueba otra búsqueda o crea uno nuevo.
          </GenericText>
        )}
        <Box ref={sentinelRef} h="1" w="full" aria-hidden />
        {isFetchingNextPage && (
          <GenericText variant="caption" textAlign="center" py={3}>
            Cargando más…
          </GenericText>
        )}
      </Box>

      <InventoryAdjustDialog
        product={inventoryProduct}
        open={inventoryProduct != null}
        onOpenChange={open => {
          if (!open) setInventoryProduct(null);
        }}
        submitting={inventoryBusy}
        onSubmit={async qtyDelta => {
          if (!inventoryProduct) return;
          setInventoryBusy(true);
          try {
            await apiFetch('/inventory/adjust', {
              method: 'POST',
              body: JSON.stringify({
                productId: inventoryProduct.id,
                qtyDelta,
                type: qtyDelta > 0 ? 'PURCHASE' : 'ADJUSTMENT',
              }),
            });
            void qc.invalidateQueries({ queryKey: ['products-infinite'] });
            void qc.invalidateQueries({ queryKey: ['product-stock-map'] });
          } finally {
            setInventoryBusy(false);
          }
        }}
      />

      {form && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
          zIndex={20}
        >
          <Box bg="white" p={4} borderRadius="md" w="full" maxW="md">
            <Stack gap={3}>
              <GenericHeading variant="section">
                {form.id ? 'Editar' : 'Nuevo'} producto
              </GenericHeading>
              <FormField label="Nombre" htmlFor={fieldIds.name}>
                <GenericInput
                  id={fieldIds.name}
                  value={form.name ?? ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </FormField>
              <FormField label="Costo USD" htmlFor={fieldIds.cost}>
                <GenericInput
                  id={fieldIds.cost}
                  decimal
                  value={form.costUsd ?? ''}
                  onChange={e => setForm({ ...form, costUsd: Number(e.target.value.replace(',', '.')) })}
                />
              </FormField>
              <FormField label="Precio venta USD" htmlFor={fieldIds.price}>
                <GenericInput
                  id={fieldIds.price}
                  decimal
                  value={form.priceUsd ?? ''}
                  onChange={e => setForm({ ...form, priceUsd: Number(e.target.value.replace(',', '.')) })}
                />
              </FormField>
              <FormField label="Código de barras" htmlFor={fieldIds.barcode}>
                <GenericInput
                  id={fieldIds.barcode}
                  value={form.barcode ?? ''}
                  onChange={e => setForm({ ...form, barcode: e.target.value })}
                />
              </FormField>
              <FormField label="Unidad de venta" htmlFor={fieldIds.unit}>
                <GenericSelect
                  options={UNIT_OPTIONS}
                  value={unitValue}
                  onChange={v => setForm({ ...form, unit: v as ProductUnit })}
                  name={fieldIds.unit}
                  aria-label="Unidad de venta"
                />
              </FormField>
              <Flex gap={2}>
                <Button flex={1} variant="outline" onClick={() => setForm(null)}>
                  Cancelar
                </Button>
                <Button
                  flex={1}
                  colorPalette="green"
                  onClick={async () => {
                    await save.mutateAsync({
                      id: form.id,
                      name: form.name!,
                      priceUsd: Number(form.priceUsd),
                      costUsd: Number(form.costUsd ?? 0),
                      unit: (form.unit ?? 'UNIT') as ProductUnit,
                      barcode: form.barcode ?? null,
                    });
                    setForm(null);
                  }}
                >
                  Guardar
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Box>
      )}
    </Flex>
  );
}
