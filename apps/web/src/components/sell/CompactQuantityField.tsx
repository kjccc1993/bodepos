import { Button, Flex, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { GenericInput, GenericText } from '@/components/ui';
import { isIncompleteDecimalDraft } from '@/lib/utils/numeric-input';
import { productCardActionsWidth } from '@/components/sell/ProductCardShell';
import { quantityPlaceholder, quantityStepperLabel } from '@/lib/cart/quantity';
import type { ProductUnit } from '@/lib/types';

type CompactQuantityFieldProps = {
  unit: ProductUnit;
  quantity: number;
  inCart: boolean;
  onQuantityChange: (raw: string) => void;
  onStep: (delta: number) => void;
  /** Oculta la etiqueta (Gramos/Unidades) en tarjetas compactas de mobile */
  hideLabel?: boolean;
};

export function CompactQuantityField({
  unit,
  quantity,
  inCart,
  onQuantityChange,
  onStep,
  hideLabel = false,
}: CompactQuantityFieldProps) {
  const integer = unit === 'UNIT';
  const decimal = unit !== 'UNIT';
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [quantity]);

  const displayed =
    draft ?? (inCart ? String(quantity).replace('.', ',') : '');

  const commitDraft = (raw: string) => {
    setDraft(null);
    onQuantityChange(raw);
  };

  return (
    <Stack
      gap={hideLabel ? 0 : 1}
      flexShrink={0}
      w={productCardActionsWidth}
      align="stretch"
      onClick={e => e.stopPropagation()}
    >
      {!hideLabel && (
        <GenericText variant="caption" textAlign="center" fontSize="2xs" color="gray.500" lineHeight="1">
          {quantityStepperLabel(unit)}
        </GenericText>
      )}

      <Flex
        align="stretch"
        h="9"
        borderWidth="1px"
        borderColor="gray.300"
        borderRadius="lg"
        bg="white"
        overflow="hidden"
        boxShadow="card"
      >
        <Button
          variant="ghost"
          borderRadius={0}
          minW="8"
          h="auto"
          px={0}
          fontSize="lg"
          fontWeight="medium"
          color="gray.600"
          borderRightWidth="1px"
          borderColor="gray.200"
          _hover={{ bg: 'gray.50' }}
          onClick={() => onStep(-1)}
          disabled={!inCart}
          aria-label="Restar"
        >
          −
        </Button>

        <GenericInput
          type="text"
          integer={integer}
          decimal={decimal}
          flex="1"
          minW={0}
          h="full"
          minH="unset"
          maxH="unset"
          px={1}
          borderWidth="0"
          borderRadius={0}
          bg="transparent"
          boxShadow="none"
          textAlign="center"
          fontWeight="semibold"
          fontSize="sm"
          _focusVisible={{ outline: 'none', boxShadow: 'none', bg: 'gray.50' }}
          placeholder={quantityPlaceholder(unit)}
          value={displayed}
          onFocus={() => {
            if (inCart) setDraft(String(quantity).replace('.', ','));
          }}
          onChange={e => {
            const next = e.target.value;
            setDraft(next);
            if (!decimal || !isIncompleteDecimalDraft(next)) onQuantityChange(next);
          }}
          onBlur={e => {
            if (draft != null) commitDraft(e.target.value);
            else if (e.target.value.trim() === '') onQuantityChange('');
          }}
        />

        <Button
          variant="ghost"
          borderRadius={0}
          minW="8"
          h="auto"
          px={0}
          fontSize="lg"
          fontWeight="medium"
          color="green.600"
          borderLeftWidth="1px"
          borderColor="gray.200"
          _hover={{ bg: 'green.50' }}
          onClick={() => onStep(1)}
          aria-label="Sumar"
        >
          +
        </Button>
      </Flex>
    </Stack>
  );
}
