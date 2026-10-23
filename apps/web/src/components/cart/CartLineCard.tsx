import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Portal, Tooltip } from '@chakra-ui/react';
import { CompactQuantityField } from '@/components/sell/CompactQuantityField';
import { ProductCardShell } from '@/components/sell/ProductCardShell';
import { lineTotalUsd, parseQuantityInput } from '@/lib/cart/quantity';
import { usdToBs } from '@/lib/money';
import type { CartLine, Product } from '@/lib/types';

export function cartLineAsProduct(line: CartLine, rate: number, stock: number): Product {
  return {
    id: line.productId,
    name: line.productName,
    priceUsd: line.unitPriceUsd,
    priceBs: usdToBs(line.unitPriceUsd, rate),
    unit: line.unit,
    stock,
    barcode: null,
    isActive: true,
  };
}

function CartRemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <Tooltip.Root openDelay={300}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label="Quitar del carrito"
          size="xs"
          variant="subtle"
          colorPalette="red"
          flexShrink={0}
          alignSelf="flex-start"
          onClick={onRemove}
        >
          <FontAwesomeIcon icon={faTrash} style={{ width: '0.75rem', height: '0.75rem' }} />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content px={2} py={1} fontSize="xs">
            Quitar
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

type Props = {
  line: CartLine;
  rate: number;
  stock: number;
  onRemove: () => void;
  onUpdateQty: (q: number) => void;
};

export function CartLineCard({ line, rate, stock, onRemove, onUpdateQty }: Props) {
  const product = cartLineAsProduct(line, rate, stock);
  const totalLine = lineTotalUsd(line);

  return (
    <ProductCardShell
      product={product}
      rate={rate}
      highlight
      lineTotalUsd={totalLine}
      headerTrailing={<CartRemoveButton onRemove={onRemove} />}
      actions={
        <CompactQuantityField
          unit={line.unit}
          quantity={line.quantity}
          inCart
          hideLabel
          onQuantityChange={raw => {
            const q = parseQuantityInput(raw, line.unit);
            if (q <= 0) onRemove();
            else onUpdateQty(q);
          }}
          onStep={delta => {
            const step = line.unit === 'UNIT' ? delta : line.unit === 'GRAM' ? delta * 100 : delta * 0.1;
            const next = Math.max(0, line.quantity + step);
            if (next <= 0) onRemove();
            else onUpdateQty(next);
          }}
        />
      }
    />
  );
}
