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
    costUsd: 0,
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
          variant="ghost"
          colorPalette="red"
          flexShrink={0}
          alignSelf="flex-start"
          minW="6"
          h="6"
          p={0}
          bg="transparent"
          color="red.600"
          _hover={{ bg: 'transparent', color: 'red.700' }}
          _active={{ bg: 'transparent', color: 'red.800' }}
          onClick={onRemove}
        >
          <FontAwesomeIcon icon={faTrash} style={{ width: '0.8rem', height: '0.8rem' }} />
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
            const step = line.unit === 'UNIT' ? delta : delta * 100;
            const next = Math.max(0, line.quantity + step);
            if (next <= 0) onRemove();
            else onUpdateQty(next);
          }}
        />
      }
    />
  );
}
