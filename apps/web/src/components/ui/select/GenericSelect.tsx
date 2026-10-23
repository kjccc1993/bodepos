import { Portal, Select, createListCollection } from '@chakra-ui/react';
import { useMemo } from 'react';
import { disabledFieldRootStyles, disabledFieldStyles, DISABLED_FIELD } from '@/components/ui/field-disabled-styles';
import { FORM_CONTROL_BORDER_RADIUS, FORM_CONTROL_HEIGHT } from '@/components/ui/form-control-metrics';

export type SelectOption = { value: string; label: string };

type GenericSelectProps = {
  options: SelectOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  invalid?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
};

export function GenericSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  name,
  invalid,
  disabled = false,
  'aria-label': ariaLabel,
}: GenericSelectProps) {
  const collection = useMemo(() => createListCollection({ items: options }), [options]);
  const hasValue = value != null && value.length > 0;
  const borderColor = invalid ? 'red.500' : disabled ? DISABLED_FIELD.borderColor : 'gray.300';

  return (
    <Select.Root
      collection={collection}
      value={hasValue ? [value] : []}
      onValueChange={details => onChange(details.value?.[0] ?? '')}
      name={name}
      size="md"
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
          h={{ base: 'touch', lg: FORM_CONTROL_HEIGHT.md }}
          minH={{ base: 'touch', lg: FORM_CONTROL_HEIGHT.md }}
          maxH={{ base: 'touch', lg: FORM_CONTROL_HEIGHT.md }}
          bg="transparent"
          borderWidth="1px"
          borderColor={borderColor}
          _focusVisible={{
            borderColor: invalid ? 'red.500' : 'green.500',
            outline: '2px solid',
            outlineColor: 'green.200',
            outlineOffset: '0px',
          }}
          {...disabledFieldStyles}
        >
          <Select.ValueText placeholder={placeholder} flex="1" minW={0} overflow="hidden" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner zIndex={50}>
          <Select.Content
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius={FORM_CONTROL_BORDER_RADIUS}
          shadow="md"
          maxH="min(320px, 50dvh)"
        >
          {options.map(item => (
            <Select.Item
              item={item}
              key={item.value}
              py={2.5}
              px={3}
              minH={{ base: 'touch', lg: undefined }}
              cursor="pointer"
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
