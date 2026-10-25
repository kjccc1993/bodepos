import { faBoxesStacked, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Box, Button, Flex, Grid, Stack } from '@chakra-ui/react';
import { useId, useState } from 'react';
import { InventoryAdjustDialog } from '@/components/products/InventoryAdjustDialog';
import { ProductCardActionIcon } from '@/components/sell/ProductCardActionIcon';
import { ProductCardShell } from '@/components/sell/ProductCardShell';
import { FormField, GenericHeading, GenericInput, GenericSelect, GenericText, type SelectOption } from '@/components/ui';
import { useProducts, useSaveProduct, useStoreSettings } from '@/lib/api/hooks';
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
  const { data: products = [], refetch } = useProducts(search);
  const save = useSaveProduct();
  const [form, setForm] = useState<Partial<Product> | null>(null);
  const [inventoryProduct, setInventoryProduct] = useState<Product | null>(null);
  const [inventoryBusy, setInventoryBusy] = useState(false);

  const unitValue = form?.unit ?? 'UNIT';
  const fieldIds = {
    name: useId(),
    price: useId(),
    barcode: useId(),
    unit: useId(),
  };

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
      <Box flexShrink={0} px={3} pt={3} pb={2} bg="white" borderBottomWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" gap={2}>
          <GenericHeading>Mis productos</GenericHeading>
          <Button
            size="sm"
            colorPalette="blue"
            flexShrink={0}
            onClick={() => setForm({ name: '', priceUsd: 1, unit: 'UNIT' })}
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
        <GenericInput
          placeholder="Buscar por nombre"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="lg"
          h="12"
          boxShadow="sm"
        />
      </Box>

      <Box flex="1" minH={0} h={0} overflowY="auto" overscrollBehavior="contain" px={3} py={3} pb={4}>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, minmax(0, 1fr))' }}
          gap={{ base: 2, md: 3 }}
          w="full"
          alignItems="start"
        >
          {products.map(p => (
            <ProductCardShell
              key={p.id}
              product={p}
              rate={rate}
              actions={
                <Flex
                  flexShrink={0}
                  h="9"
                  gap="10px"
                  align="stretch"
                  ms="auto"
                  onClick={e => e.stopPropagation()}
                >
                  <ProductCardActionIcon
                    label="Editar"
                    icon={faPenToSquare}
                    colorPalette="blue"
                    onClick={() => setForm(p)}
                  />
                  <ProductCardActionIcon
                    label="Inventario"
                    icon={faBoxesStacked}
                    colorPalette="green"
                    onClick={() => setInventoryProduct(p)}
                  />
                </Flex>
              }
            />
          ))}
        </Grid>
        {products.length === 0 && (
          <GenericText variant="muted" textAlign="center" py={8}>
            No hay productos. Prueba otra búsqueda o crea uno nuevo.
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
            void refetch();
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
              <FormField label="Precio USD" htmlFor={fieldIds.price}>
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
