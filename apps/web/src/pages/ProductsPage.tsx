import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useCallback, useId, useRef, useState } from 'react';
import { AdminCatalogGrid } from '@/components/products/AdminCatalogGrid';
import { InventoryAdjustDialog } from '@/components/products/InventoryAdjustDialog';
import { ProductSearchWithCategory } from '@/components/products/ProductSearchWithCategory';
import {
  FormField,
  GenericHeading,
  GenericInput,
  GenericSelect,
  GenericText,
  MoneyAmountInput,
  ProfitPercentInput,
  type SelectOption,
} from '@/components/ui';
import { useProductCategories, useSaveProduct, useStoreSettings } from '@/lib/api/hooks';
import { useInfiniteProductList } from '@/lib/hooks/useInfiniteProductList';
import { useQueryClient } from '@tanstack/react-query';
import {
  formatBs,
  priceUsdFromProfitMarkupPercent,
  profitMarkupPercent,
  roundUsd,
  usdToBs,
} from '@/lib/money';
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
  const [categoryId, setCategoryId] = useState('');
  const { data: categories = [] } = useProductCategories();
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const [form, setForm] = useState<Partial<Product> | null>(null);
  const [lockedProfitPct, setLockedProfitPct] = useState<number | null>(null);
  const priceDriverRef = useRef<'profit' | 'price' | null>(null);
  const [inventoryProduct, setInventoryProduct] = useState<Product | null>(null);
  const [inventoryBusy, setInventoryBusy] = useState(false);
  const { products, sentinelRef, isLoading, isFetchingNextPage } = useInfiniteProductList(search, categoryId);

  const openProductForm = useCallback((p: Partial<Product>) => {
    priceDriverRef.current = null;
    setLockedProfitPct(null);
    setForm(p);
  }, []);

  const onEdit = useCallback((p: Product) => openProductForm(p), [openProductForm]);
  const onInventory = useCallback((p: Product) => setInventoryProduct(p), []);
  const save = useSaveProduct();
  const qc = useQueryClient();
  const formCostUsd = Number(form?.costUsd ?? 0);
  const formPriceUsd = Number(form?.priceUsd ?? 0);
  const derivedProfitPct = form ? profitMarkupPercent(formCostUsd, formPriceUsd) : null;
  const formProfitPct =
    priceDriverRef.current === 'profit' && lockedProfitPct != null ? lockedProfitPct : derivedProfitPct;

  const unitValue = form?.unit ?? 'UNIT';
  const fieldIds = {
    name: useId(),
    price: useId(),
    priceBs: useId(),
    cost: useId(),
    profit: useId(),
    barcode: useId(),
    unit: useId(),
    category: useId(),
  };

  const defaultCategoryId = categories.find(c => c.name === 'Despensa')?.id ?? categories[0]?.id ?? null;

  return (
    <Flex direction="column" flex="1" minH={0} h={0} w="full">
      <Box flexShrink={0} px={3} pt={3} pb={2} bg="white" borderBottomWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" gap={2}>
          <GenericHeading>Mis productos</GenericHeading>
          <Button
            size="sm"
            colorPalette="green"
            flexShrink={0}
            onClick={() =>
              openProductForm({
                name: '',
                priceUsd: 1,
                costUsd: 0,
                unit: 'UNIT',
                categoryId: defaultCategoryId,
              })
            }
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
        <ProductSearchWithCategory
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre"
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories}
          searchBoxShadow="sm"
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
              <FormField label="Categoría" htmlFor={fieldIds.category}>
                <GenericSelect
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={form.categoryId ?? ''}
                  onChange={v => setForm({ ...form, categoryId: v || null })}
                  name={fieldIds.category}
                  aria-label="Categoría"
                />
              </FormField>
              <FormField label="Nombre" htmlFor={fieldIds.name}>
                <GenericInput
                  id={fieldIds.name}
                  value={form.name ?? ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </FormField>
              <FormField label="Costo" htmlFor={fieldIds.cost}>
                <MoneyAmountInput
                  id={fieldIds.cost}
                  value={Number(form.costUsd ?? 0)}
                  onChange={costUsd => {
                    const cost = roundUsd(costUsd);
                    if (priceDriverRef.current === 'profit' && lockedProfitPct != null && cost > 0) {
                      setForm({
                        ...form,
                        costUsd: cost,
                        priceUsd: priceUsdFromProfitMarkupPercent(cost, lockedProfitPct),
                      });
                      return;
                    }
                    setForm({ ...form, costUsd: cost });
                  }}
                />
              </FormField>
              <FormField label="Ganancia %" htmlFor={fieldIds.profit}>
                <ProfitPercentInput
                  id={fieldIds.profit}
                  value={formProfitPct}
                  onChange={profitPct => {
                    priceDriverRef.current = 'profit';
                    setLockedProfitPct(roundUsd(profitPct));
                    const cost = roundUsd(Number(form.costUsd ?? 0));
                    if (cost > 0) {
                      setForm({
                        ...form,
                        priceUsd: priceUsdFromProfitMarkupPercent(cost, profitPct),
                      });
                    }
                  }}
                />
              </FormField>
              {formCostUsd <= 0 && (
                <GenericText variant="muted" fontSize="sm" px={0.5}>
                  Indica un costo mayor a 0 para calcular la ganancia.
                </GenericText>
              )}
              <Flex direction={{ base: 'column', md: 'row' }} gap={2} w="full">
                <Box flex={1} minW={0}>
                  <FormField label="Precio venta USD" htmlFor={fieldIds.price}>
                    <MoneyAmountInput
                      id={fieldIds.price}
                      value={formPriceUsd}
                      onChange={priceUsd => {
                        priceDriverRef.current = 'price';
                        setLockedProfitPct(null);
                        setForm({ ...form, priceUsd: roundUsd(priceUsd) });
                      }}
                    />
                  </FormField>
                </Box>
                <Box flex={1} minW={0}>
                  <FormField label="Precio venta Bs" htmlFor={fieldIds.priceBs}>
                    <GenericInput
                      id={fieldIds.priceBs}
                      readOnly
                      disabled
                      value={formatBs(usdToBs(formPriceUsd, rate))}
                      bg="gray.50"
                    />
                  </FormField>
                </Box>
              </Flex>
              {formProfitPct != null && formProfitPct < 0 && (
                <GenericText variant="error" fontSize="sm" px={0.5}>
                  El precio de venta es menor que el costo.
                </GenericText>
              )}
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
                <Button
                  flex={1}
                  variant="outline"
                  onClick={() => {
                    priceDriverRef.current = null;
                    setLockedProfitPct(null);
                    setForm(null);
                  }}
                >
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
                      categoryId: form.categoryId ?? null,
                    });
                    priceDriverRef.current = null;
                    setLockedProfitPct(null);
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
