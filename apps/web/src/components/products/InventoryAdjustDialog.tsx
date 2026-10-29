import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, CloseButton, Dialog, Flex, Portal, Stack, chakra } from '@chakra-ui/react';
import { useEffect, useId, useState } from 'react';
import { FormField, GenericInput, GenericText } from '@/components/ui';
import { parseStockQuantity } from '@/lib/cart/quantity';
import type { Product, ProductUnit } from '@/lib/types';

type Direction = 'in' | 'out';

const directionOptions: { value: Direction; label: string; icon: typeof faPlus }[] = [
  { value: 'in', label: 'Ingresar', icon: faPlus },
  { value: 'out', label: 'Retirar', icon: faMinus },
];

function InventoryDirectionToggle({
  value,
  onChange,
}: {
  value: Direction;
  onChange: (value: Direction) => void;
}) {
  return (
    <Flex
      w="full"
      p={1}
      gap={1}
      bg="gray.100"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      role="radiogroup"
      aria-label="Tipo de ajuste de inventario"
    >
      {directionOptions.map(opt => {
        const selected = value === opt.value;
        const isIn = opt.value === 'in';
        return (
          <chakra.button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            flex={1}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            py={2.5}
            px={3}
            borderRadius="lg"
            fontWeight="semibold"
            fontSize="sm"
            lineHeight="1.2"
            cursor="pointer"
            borderWidth="1px"
            borderColor={selected ? 'transparent' : 'transparent'}
            bg={
              selected
                ? isIn
                  ? 'green.500'
                  : 'red.500'
                : 'transparent'
            }
            color={selected ? 'white' : 'gray.700'}
            boxShadow={selected ? '0 1px 3px rgba(15, 23, 42, 0.12)' : 'none'}
            transition="background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease"
            _hover={
              selected
                ? undefined
                : { bg: 'white', color: isIn ? 'green.700' : 'red.600' }
            }
            _focusVisible={{ outline: '2px solid', outlineColor: isIn ? 'green.400' : 'red.400', outlineOffset: '2px' }}
            onClick={() => onChange(opt.value)}
          >
            <FontAwesomeIcon icon={opt.icon} style={{ width: '0.875rem', height: '0.875rem' }} />
            {opt.label}
          </chakra.button>
        );
      })}
    </Flex>
  );
}

function amountPlaceholder(unit: ProductUnit, direction: Direction) {
  const verb = direction === 'in' ? 'ingresar' : 'retirar';
  if (unit === 'UNIT') return `Unidades a ${verb}`;
  return `Kg a ${verb}`;
}

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (qtyDelta: number) => Promise<void>;
  submitting?: boolean;
};

export function InventoryAdjustDialog({
  product,
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: Props) {
  const [direction, setDirection] = useState<Direction>('in');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const amountId = useId();

  useEffect(() => {
    if (!open) return;
    setDirection('in');
    setAmount('');
    setError('');
  }, [open, product?.id]);

  if (!product) return null;

  const integer = product.unit === 'UNIT';
  const decimal = product.unit !== 'UNIT';

  const submit = async () => {
    setError('');
    const qty = parseStockQuantity(amount, product.unit);
    if (qty <= 0) {
      setError('Ingresa una cantidad válida mayor a cero.');
      return;
    }
    const qtyDelta = direction === 'in' ? qty : -qty;
    try {
      await onSubmit(qtyDelta);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el inventario.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={e => onOpenChange(e.open)} placement="center" motionPreset="scale">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={4}>
          <Dialog.Content maxW="sm" w="full" m="auto" borderRadius="lg" boxShadow="lg">
            <Dialog.Header flexShrink={0} borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}>
              <Dialog.Title fontSize="lg" fontWeight="semibold">
                Inventario
              </Dialog.Title>
              <GenericText variant="caption" mt={0.5} lineClamp={2}>
                {product.name}
              </GenericText>
              <Dialog.CloseTrigger asChild position="absolute" top={2} right={2}>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={4} py={4}>
              <Stack gap={4}>
                <FormField label="Tipo de movimiento">
                  <InventoryDirectionToggle value={direction} onChange={setDirection} />
                </FormField>

                <FormField label="Cantidad" htmlFor={amountId}>
                  <GenericInput
                    id={amountId}
                    placeholder={amountPlaceholder(product.unit, direction)}
                    value={amount}
                    onChange={e => {
                      setAmount(e.target.value);
                      if (error) setError('');
                    }}
                    integer={integer}
                    decimal={decimal}
                    inputMode={integer ? 'numeric' : 'decimal'}
                    size="lg"
                    h="12"
                    bg="gray.50"
                    borderWidth="1px"
                    borderColor="gray.200"
                  />
                </FormField>

                {error && <GenericText variant="error">{error}</GenericText>}

                <Flex gap={2}>
                  <Button flex={1} variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button flex={1} colorPalette="green" onClick={() => void submit()} loading={submitting}>
                    Aplicar
                  </Button>
                </Flex>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
