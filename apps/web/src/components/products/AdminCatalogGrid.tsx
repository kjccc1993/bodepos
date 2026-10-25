import { faBoxesStacked, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Flex } from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { ProductCardActionIcon } from '@/components/sell/ProductCardActionIcon';
import { ProductCardShell } from '@/components/sell/ProductCardShell';
import { VirtualizedProductGrid } from '@/components/sell/VirtualizedProductGrid';
import { useProductGridColumns } from '@/lib/hooks/useProductGridColumns';
import type { Product } from '@/lib/types';

type RowProps = {
  product: Product;
  rate: number;
  onEdit: (product: Product) => void;
  onInventory: (product: Product) => void;
};

const AdminProductRow = memo(function AdminProductRow({ product, rate, onEdit, onInventory }: RowProps) {
  return (
    <ProductCardShell
      product={product}
      rate={rate}
      actions={
        <Flex flexShrink={0} h="10" gap="10px" align="stretch" ms="auto" onClick={e => e.stopPropagation()}>
          <ProductCardActionIcon
            label="Editar"
            icon={faPenToSquare}
            tone="secondary"
            onClick={() => onEdit(product)}
          />
          <ProductCardActionIcon
            label="Inventario"
            icon={faBoxesStacked}
            tone="primary"
            onClick={() => onInventory(product)}
          />
        </Flex>
      }
    />
  );
});

type GridProps = {
  products: Product[];
  rate: number;
  scrollRoot: HTMLElement | null;
  onEdit: (product: Product) => void;
  onInventory: (product: Product) => void;
};

export const AdminCatalogGrid = memo(function AdminCatalogGrid({
  products,
  rate,
  scrollRoot,
  onEdit,
  onInventory,
}: GridProps) {
  const { columnCount, templateColumns } = useProductGridColumns('admin');

  const renderProduct = useCallback(
    (p: Product) => (
      <AdminProductRow
        key={p.id}
        product={p}
        rate={rate}
        onEdit={onEdit}
        onInventory={onInventory}
      />
    ),
    [rate, onEdit, onInventory],
  );

  return (
    <VirtualizedProductGrid
      products={products}
      columnCount={columnCount}
      templateColumns={templateColumns}
      scrollRoot={scrollRoot}
      mode="admin"
      listKey="admin-products"
      renderProduct={renderProduct}
    />
  );
});
