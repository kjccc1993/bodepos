import { memo, useCallback } from 'react';
import { CompactQuantityField } from '@/components/sell/CompactQuantityField';
import { ProductCardShell } from '@/components/sell/ProductCardShell';
import { VirtualizedProductGrid } from '@/components/sell/VirtualizedProductGrid';
import { useProductGridColumns } from '@/lib/hooks/useProductGridColumns';
import type { Product } from '@/lib/types';

type RowProps = {
  product: Product;
  rate: number;
  quantity: number;
  onQuantityChange: (product: Product, raw: string) => void;
  onStep: (product: Product, delta: number) => void;
};

const SellProductRow = memo(function SellProductRow({
  product,
  rate,
  quantity,
  onQuantityChange,
  onStep,
}: RowProps) {
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
          onQuantityChange={raw => onQuantityChange(product, raw)}
          onStep={delta => onStep(product, delta)}
        />
      }
    />
  );
});

type GridProps = {
  products: Product[];
  rate: number;
  activeSlot: number;
  scrollRoot: HTMLElement | null;
  qtyByProductId: Map<string, number>;
  onQuantityChange: (product: Product, raw: string) => void;
  onStep: (product: Product, delta: number) => void;
};

export const SellCatalogGrid = memo(function SellCatalogGrid({
  products,
  rate,
  activeSlot,
  scrollRoot,
  qtyByProductId,
  onQuantityChange,
  onStep,
}: GridProps) {
  const { columnCount, templateColumns } = useProductGridColumns('sell');

  const renderProduct = useCallback(
    (p: Product) => (
      <SellProductRow
        key={p.id}
        product={p}
        rate={rate}
        quantity={qtyByProductId.get(p.id) ?? 0}
        onQuantityChange={onQuantityChange}
        onStep={onStep}
      />
    ),
    [rate, qtyByProductId, onQuantityChange, onStep],
  );

  return (
    <VirtualizedProductGrid
      products={products}
      columnCount={columnCount}
      templateColumns={templateColumns}
      scrollRoot={scrollRoot}
      mode="sell"
      listKey={`sell-${activeSlot}`}
      renderProduct={renderProduct}
    />
  );
});
