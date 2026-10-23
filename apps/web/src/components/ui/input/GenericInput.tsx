import { Input, type InputProps } from '@chakra-ui/react';
import { forwardRef, type ChangeEvent } from 'react';
import { disabledFieldStyles } from '@/components/ui/field-disabled-styles';
import { FORM_CONTROL_BORDER_RADIUS, resolveFormControlHeight } from '@/components/ui/form-control-metrics';
import { sanitizeDecimalInput, sanitizeIntegerInput } from '@/lib/utils/numeric-input';

export type GenericInputProps = InputProps & {
  invalid?: boolean;
  integer?: boolean;
  decimal?: boolean;
};

const borderColor = (invalid?: boolean) => (invalid ? 'red.500' : 'gray.300');

export const GenericInput = forwardRef<HTMLInputElement, GenericInputProps>(function GenericInput(
  { invalid, size = 'md', integer = false, decimal = false, inputMode, onChange, ...props },
  ref,
) {
  const resolvedHeight = resolveFormControlHeight(size);
  const fieldHeight = { base: 'touch', lg: resolvedHeight };

  const resolvedInputMode = inputMode ?? (decimal ? 'decimal' : integer ? 'numeric' : undefined);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (integer) e.target.value = sanitizeIntegerInput(e.target.value);
    else if (decimal) e.target.value = sanitizeDecimalInput(e.target.value);
    onChange?.(e);
  };

  return (
    <Input
      ref={ref}
      size={size}
      h={fieldHeight}
      minH={fieldHeight}
      maxH={fieldHeight}
      bg="white"
      color="gray.900"
      borderWidth="1px"
      borderRadius={FORM_CONTROL_BORDER_RADIUS}
      borderColor={borderColor(invalid)}
      _placeholder={{ color: 'gray.400' }}
      _hover={{ borderColor: invalid ? 'red.500' : 'gray.400' }}
      _focusVisible={{
        borderColor: invalid ? 'red.500' : 'green.500',
        outline: '2px solid',
        outlineColor: 'green.200',
        outlineOffset: '0px',
      }}
      inputMode={resolvedInputMode}
      onChange={handleChange}
      {...disabledFieldStyles}
      {...props}
    />
  );
});
