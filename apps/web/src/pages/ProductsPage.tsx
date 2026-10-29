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
  formatUsd,
  priceUsdFromProfitMarkupPercent,
  profitMarkupPercent,
  roundUsd,
  usdToBs,
} from '@/lib/money';
import {
  deriveUnitAmountsFromPackage,
  resolveProductPricing,
  type PriceInputMode,
} from '@/lib/product-pricing';
import { effectiveRate } from '@/lib/rate';
import type { Product, ProductUnit } from '@/lib/types';
import { apiFetch } from '@/lib/http/client';
import { headerCreateButtonProps } from '@/lib/design/surface-styles';

const UNIT_OPTIONS: SelectOption[] = [
  { value: 'UNIT', label: 'Unidad' },
  { value: 'KG', label: 'Kilogramos' },
];

const PRICE_MODE_OPTIONS: SelectOption[] = [
  { value: 'UNIT', label: 'Por unidad' },
  { value: 'PACKAGE', label: 'Por paquete' },
];

function withPackageCapture(
  form: Partial<Product>,
  packageCostUsd: number,
  packagePriceUsd: number,
  unitsPerPackage: number | null,
): Partial<Product> {
  const derived = deriveUnitAmountsFromPackage(packageCostUsd, packagePriceUsd, unitsPerPackage);
  const canDerive =
    unitsPerPackage != null && Number.isInteger(unitsPerPackage) && unitsPerPackage >= 1 && packagePriceUsd > 0;
  return {
    ...form,
    priceInputMode: 'PACKAGE',
    unitsPerPackage,
    packageCostUsd,
    packagePriceUsd,
    ...(canDerive ? derived : {}),
  };
}

export function ProductsPage() {
  const { data: settings } = useStoreSettings();
  const rate = effectiveRate(settings);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { data: categories = [] } = useProductCategories();
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const [form, setForm] = useState<Partial<Product> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [lockedProfitPct, setLockedProfitPct] = useState<number | null>(null);
  const priceDriverRef = useRef<'profit' | 'price' | null>(null);
  const [inventoryProduct, setInventoryProduct] = useState<Product | null>(null);
  const [inventoryBusy, setInventoryBusy] = useState(false);
  const { products, sentinelRef, isLoading, isFetchingNextPage } = useInfiniteProductList(search, categoryId);

  const openProductForm = useCallback((p: Partial<Product>) => {
    priceDriverRef.current = null;
    setLockedProfitPct(null);
    setFormError(null);
    setForm(p);
  }, []);

  const onEdit = useCallback((p: Product) => openProductForm(p), [openProductForm]);
  const onInventory = useCallback((p: Product) => setInventoryProduct(p), []);
  const save = useSaveProduct();
  const qc = useQueryClient();
  const unitValue = form?.unit ?? 'UNIT';
  const sellsByUnit = unitValue === 'UNIT';
  const packageMode = sellsByUnit && form?.priceInputMode === 'PACKAGE';
  const editedCostUsd = packageMode ? Number(form?.packageCostUsd ?? 0) : Number(form?.costUsd ?? 0);
  const editedPriceUsd = packageMode ? Number(form?.packagePriceUsd ?? 0) : Number(form?.priceUsd ?? 0);
  const packageUnits = form?.unitsPerPackage ?? null;
  const derivedUnit = deriveUnitAmountsFromPackage(
    roundUsd(Number(form?.packageCostUsd ?? 0)),
    roundUsd(Number(form?.packagePriceUsd ?? 0)),
    packageUnits,
  );
  const showDerivedUnit =
    packageMode && packageUnits != null && Number.isInteger(packageUnits) && packageUnits >= 1 && editedPriceUsd > 0;
  const derivedProfitPct = form ? profitMarkupPercent(editedCostUsd, editedPriceUsd) : null;
  const formProfitPct =
    priceDriverRef.current === 'profit' && lockedProfitPct != null ? lockedProfitPct : derivedProfitPct;
  const costLabel = !sellsByUnit ? 'Costo USD / kg' : packageMode ? 'Costo del paquete' : 'Costo unitario';
  const priceLabel = !sellsByUnit ? 'Precio venta USD / kg' : packageMode ? 'Precio del paquete' : 'Precio unitario';
  const priceBsLabel = packageMode
    ? 'Precio del paquete Bs'
    : sellsByUnit
      ? 'Precio venta Bs'
      : 'Precio venta Bs / kg';

  const fieldIds = {
    name: useId(),
    price: useId(),
    priceBs: useId(),
    cost: useId(),
    profit: useId(),
    barcode: useId(),
    unit: useId(),
    category: useId(),
    priceMode: useId(),
    units: useId(),
    unitCost: useId(),
    unitPrice: useId(),
    unitPriceBs: useId(),
  };

  const defaultCategoryId = categories.find(c => c.name === 'Despensa')?.id ?? categories[0]?.id ?? null;

  return (
    <Flex direction="column" flex="1" minH={0} h={0} w="full">
      <Box flexShrink={0} px={3} pt={3} pb={2} bg="white" borderBottomWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center" gap={2}>
          <GenericHeading>Mis productos</GenericHeading>
          <Button
            flexShrink={0}
            onClick={() =>
              openProductForm({
                name: '',
                priceUsd: 1,
                costUsd: 0,
                unit: 'UNIT',
                priceInputMode: 'UNIT',
                unitsPerPackage: null,
                packageCostUsd: null,
                packagePriceUsd: null,
                categoryId: defaultCategoryId,
              })
            }
            {...headerCreateButtonProps}
          >
            Nuevo producto
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
          <Box bg="white" p={4} borderRadius="md" w="full" maxW="md" maxH="100%" overflowY="auto">
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
              <FormField label="Unidad de venta" htmlFor={fieldIds.unit}>
                <GenericSelect
                  options={UNIT_OPTIONS}
                  value={unitValue}
                  onChange={v => {
                    const unit = v as ProductUnit;
                    setFormError(null);
                    if (unit !== 'UNIT') {
                      priceDriverRef.current = null;
                      setLockedProfitPct(null);
                      setForm({
                        ...form,
                        unit,
                        priceInputMode: 'UNIT',
                        unitsPerPackage: null,
                        packageCostUsd: null,
                        packagePriceUsd: null,
                      });
                      return;
                    }
                    setForm({ ...form, unit });
                  }}
                  name={fieldIds.unit}
                  aria-label="Unidad de venta"
                />
              </FormField>
              {sellsByUnit && (
                <FormField label="Captura de precio" htmlFor={fieldIds.priceMode}>
                  <GenericSelect
                    options={PRICE_MODE_OPTIONS}
                    value={packageMode ? 'PACKAGE' : 'UNIT'}
                    onChange={v => {
                      const mode = v as PriceInputMode;
                      priceDriverRef.current = null;
                      setLockedProfitPct(null);
                      setFormError(null);
                      if (mode === 'PACKAGE') {
                        setForm(
                          withPackageCapture(
                            form,
                            roundUsd(Number(form.packageCostUsd ?? 0)),
                            roundUsd(Number(form.packagePriceUsd ?? 0)),
                            form.unitsPerPackage ?? null,
                          ),
                        );
                        return;
                      }
                      setForm({
                        ...form,
                        priceInputMode: 'UNIT',
                        unitsPerPackage: null,
                        packageCostUsd: null,
                        packagePriceUsd: null,
                      });
                    }}
                    name={fieldIds.priceMode}
                    aria-label="Captura de precio"
                  />
                </FormField>
              )}
              {packageMode && (
                <FormField label="Unidades por paquete" htmlFor={fieldIds.units}>
                  <GenericInput
                    id={fieldIds.units}
                    integer
                    inputMode="numeric"
                    placeholder="Ej. 24"
                    value={form.unitsPerPackage ?? ''}
                    onChange={e => {
                      const raw = e.target.value;
                      const unitsPerPackage = raw === '' ? null : Number(raw);
                      setFormError(null);
                      setForm(
                        withPackageCapture(
                          form,
                          roundUsd(Number(form.packageCostUsd ?? 0)),
                          roundUsd(Number(form.packagePriceUsd ?? 0)),
                          unitsPerPackage,
                        ),
                      );
                    }}
                  />
                </FormField>
              )}
              <Flex direction={{ base: 'column', md: 'row' }} gap={2} w="full">
                <Box flex={1} minW={0}>
                  <FormField label={costLabel} htmlFor={fieldIds.cost}>
                    <MoneyAmountInput
                      id={fieldIds.cost}
                      value={editedCostUsd}
                      onChange={costUsd => {
                        const cost = roundUsd(costUsd);
                        setFormError(null);
                        if (packageMode) {
                          const packagePriceUsd =
                            priceDriverRef.current === 'profit' && lockedProfitPct != null && cost > 0
                              ? priceUsdFromProfitMarkupPercent(cost, lockedProfitPct)
                              : roundUsd(Number(form.packagePriceUsd ?? 0));
                          setForm(withPackageCapture(form, cost, packagePriceUsd, form.unitsPerPackage ?? null));
                          return;
                        }
                        if (priceDriverRef.current === 'profit' && lockedProfitPct != null && cost > 0) {
                          setForm({
                            ...form,
                            priceInputMode: 'UNIT',
                            costUsd: cost,
                            priceUsd: priceUsdFromProfitMarkupPercent(cost, lockedProfitPct),
                            unitsPerPackage: null,
                            packageCostUsd: null,
                            packagePriceUsd: null,
                          });
                          return;
                        }
                        setForm({
                          ...form,
                          priceInputMode: sellsByUnit ? 'UNIT' : form.priceInputMode,
                          costUsd: cost,
                          unitsPerPackage: null,
                          packageCostUsd: null,
                          packagePriceUsd: null,
                        });
                      }}
                    />
                  </FormField>
                </Box>
                <Box flex={1} minW={0}>
                  <FormField label="Ganancia %" htmlFor={fieldIds.profit}>
                    <ProfitPercentInput
                      id={fieldIds.profit}
                      value={formProfitPct}
                      onChange={profitPct => {
                        priceDriverRef.current = 'profit';
                        setLockedProfitPct(roundUsd(profitPct));
                        setFormError(null);
                        const cost = roundUsd(editedCostUsd);
                        if (cost <= 0) return;
                        const price = priceUsdFromProfitMarkupPercent(cost, profitPct);
                        if (packageMode) {
                          setForm(withPackageCapture(form, cost, price, form.unitsPerPackage ?? null));
                          return;
                        }
                        setForm({ ...form, priceUsd: price });
                      }}
                    />
                  </FormField>
                </Box>
              </Flex>
              {editedCostUsd <= 0 && (
                <GenericText variant="muted" fontSize="sm" px={0.5}>
                  Indica un costo mayor a 0 para calcular la ganancia.
                </GenericText>
              )}
              <Flex direction={{ base: 'column', md: 'row' }} gap={2} w="full">
                <Box flex={1} minW={0}>
                  <FormField label={priceLabel} htmlFor={fieldIds.price}>
                    <MoneyAmountInput
                      id={fieldIds.price}
                      value={editedPriceUsd}
                      onChange={priceUsd => {
                        priceDriverRef.current = 'price';
                        setLockedProfitPct(null);
                        setFormError(null);
                        const price = roundUsd(priceUsd);
                        if (packageMode) {
                          setForm(
                            withPackageCapture(
                              form,
                              roundUsd(Number(form.packageCostUsd ?? 0)),
                              price,
                              form.unitsPerPackage ?? null,
                            ),
                          );
                          return;
                        }
                        setForm({
                          ...form,
                          priceInputMode: sellsByUnit ? 'UNIT' : form.priceInputMode,
                          priceUsd: price,
                          unitsPerPackage: null,
                          packageCostUsd: null,
                          packagePriceUsd: null,
                        });
                      }}
                    />
                  </FormField>
                </Box>
                <Box flex={1} minW={0}>
                  <FormField label={priceBsLabel} htmlFor={fieldIds.priceBs}>
                    <GenericInput
                      id={fieldIds.priceBs}
                      readOnly
                      disabled
                      value={formatBs(usdToBs(editedPriceUsd, rate))}
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
              {packageMode && (
                <Stack gap={2}>
                  <GenericText variant="muted" fontSize="sm" px={0.5}>
                    Precio unitario = precio del paquete / unidades. La venta sigue siendo por unidad.
                  </GenericText>
                  <Flex direction={{ base: 'column', md: 'row' }} gap={2} w="full">
                    <Box flex={1} minW={0}>
                      <FormField label="Costo unitario" htmlFor={fieldIds.unitCost}>
                        <GenericInput
                          id={fieldIds.unitCost}
                          readOnly
                          disabled
                          value={showDerivedUnit ? formatUsd(derivedUnit.costUsd) : '—'}
                          bg="gray.50"
                        />
                      </FormField>
                    </Box>
                    <Box flex={1} minW={0}>
                      <FormField label="Precio unitario" htmlFor={fieldIds.unitPrice}>
                        <GenericInput
                          id={fieldIds.unitPrice}
                          readOnly
                          disabled
                          value={showDerivedUnit ? formatUsd(derivedUnit.priceUsd) : '—'}
                          bg="gray.50"
                        />
                      </FormField>
                    </Box>
                  </Flex>
                  <FormField label="Precio unitario Bs" htmlFor={fieldIds.unitPriceBs}>
                    <GenericInput
                      id={fieldIds.unitPriceBs}
                      readOnly
                      disabled
                      value={showDerivedUnit ? formatBs(usdToBs(derivedUnit.priceUsd, rate)) : '—'}
                      bg="gray.50"
                    />
                  </FormField>
                </Stack>
              )}
              <FormField label="Código de barras" htmlFor={fieldIds.barcode}>
                <GenericInput
                  id={fieldIds.barcode}
                  value={form.barcode ?? ''}
                  onChange={e => setForm({ ...form, barcode: e.target.value })}
                />
              </FormField>
              {formError && (
                <GenericText variant="error" fontSize="sm" px={0.5}>
                  {formError}
                </GenericText>
              )}
              <Flex gap={2}>
                <Button
                  flex={1}
                  variant="outline"
                  onClick={() => {
                    priceDriverRef.current = null;
                    setLockedProfitPct(null);
                    setFormError(null);
                    setForm(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  flex={1}
                  colorPalette="green"
                  loading={save.isPending}
                  onClick={async () => {
                    const unit = (form.unit ?? 'UNIT') as ProductUnit;
                    const resolved = resolveProductPricing({
                      unit,
                      priceInputMode: unit === 'UNIT' ? (form.priceInputMode ?? 'UNIT') : 'UNIT',
                      unitsPerPackage: unit === 'UNIT' ? (form.unitsPerPackage ?? null) : null,
                      packagePriceUsd: unit === 'UNIT' ? (form.packagePriceUsd ?? null) : null,
                      packageCostUsd: unit === 'UNIT' ? (form.packageCostUsd ?? null) : null,
                      priceUsd: Number(form.priceUsd),
                      costUsd: Number(form.costUsd ?? 0),
                    });
                    if (!resolved.ok) {
                      setFormError(resolved.message);
                      return;
                    }
                    try {
                      await save.mutateAsync({
                        id: form.id,
                        name: form.name ?? '',
                        unit,
                        barcode: form.barcode ?? null,
                        categoryId: form.categoryId ?? null,
                        ...resolved.value,
                      });
                      priceDriverRef.current = null;
                      setLockedProfitPct(null);
                      setFormError(null);
                      setForm(null);
                    } catch (e) {
                      setFormError(e instanceof Error ? e.message : 'No se pudo guardar el producto.');
                    }
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
