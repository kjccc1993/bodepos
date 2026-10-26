import { Portal, Select, createListCollection } from '@chakra-ui/react';
import { useMemo } from 'react';
import { disabledFieldRootStyles, disabledFieldStyles, DISABLED_FIELD } from '@/components/ui/field-disabled-styles';
import {
  FORM_CONTROL_BORDER_RADIUS,
  formControlFieldHeight,
  type FormControlSize,
} from '@/components/ui/form-control-metrics';
import { inputFocusProps } from '@/lib/design/surface-styles';

export type SelectOption = { value: string; label: string };

type GenericSelectProps = {
  options: SelectOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: FormControlSize;
  'aria-label'?: string;
  /** Ancho mínimo del menú (útil cuando el trigger es estrecho). */
  menuMinWidth?: string;
  menuPlacement?: 'bottom-start' | 'bottom-end';
};

export function GenericSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  name,
  invalid,
  disabled = false,
  size = 'md',
  'aria-label': ariaLabel,
  menuMinWidth,
  menuPlacement = 'bottom-start',
}: GenericSelectProps) {
  const collection = useMemo(() => createListCollection({ items: options }), [options]);
  const hasValue = value != null && value.length > 0;
  const borderColor = invalid ? 'red.500' : disabled ? DISABLED_FIELD.borderColor : 'gray.300';
  const fieldHeight = formControlFieldHeight(size);
  const selectSize = size === 'xl' ? 'lg' : size;

  return (
    <Select.Root
      collection={collection}
      value={hasValue ? [value] : []}
      onValueChange={details => onChange(details.value?.[0] ?? '')}
      name={name}
      size={selectSize}
      w="full"
      minW={0}
      borderRadius={FORM_CONTROL_BORDER_RADIUS}
      borderColor={borderColor}
      invalid={invalid}
      bg={disabled ? DISABLED_FIELD.bg : 'white'}
      disabled={disabled}
      {...disabledFieldRootStyles}
    >
      <Select.HiddenSelect />
      <Select.Control w="full" minW={0}>
        <Select.Trigger
          aria-label={ariaLabel}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          borderRadius={FORM_CONTROL_BORDER_RADIUS}
          w="full"
          minW={0}
          h={fieldHeight}
          minH={fieldHeight}
          maxH={fieldHeight}
          bg="transparent"
          borderWidth="1px"
          borderColor={borderColor}
          _focusVisible={
            invalid
              ? { borderColor: 'red.500', outline: '2px solid', outlineColor: 'red.100', outlineOffset: '0px' }
              : inputFocusProps
          }
          {...disabledFieldStyles}
        >
          <Select.ValueText placeholder={placeholder} flex="1" minW={0} overflow="hidden" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner zIndex={50} position={menuPlacement}>
          <Select.Content
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius={FORM_CONTROL_BORDER_RADIUS}
            shadow="md"
            maxH="min(320px, 50dvh)"
            minW={menuMinWidth ?? 'var(--reference-width)'}
            w={menuMinWidth ? 'max-content' : undefined}
            maxW={menuMinWidth ? 'min(20rem, calc(100dvw - 1rem))' : undefined}
            overflowX="hidden"
          >
            {options.map(item => (
              <Select.Item
                item={item}
                key={item.value}
                py={2.5}
                px={3}
                minH={{ base: 'touch', lg: undefined }}
                cursor="pointer"
                whiteSpace={menuMinWidth ? 'nowrap' : undefined}
                _hover={{ bg: 'gray.50' }}
              >
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
