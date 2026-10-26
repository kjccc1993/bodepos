import { Box, IconButton } from '@chakra-ui/react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { GenericInput, type GenericInputProps } from '@/components/ui/input/GenericInput';

export type GenericSearchInputProps = Omit<GenericInputProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

/** Evita autofill de contraseñas / tarjetas en buscadores (Safari iOS, Chrome). */
const searchAutofillProps = {
  type: 'search' as const,
  name: 'bodepos-catalog-search',
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  enterKeyHint: 'search' as const,
  role: 'searchbox' as const,
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-form-type': 'other',
};

export function GenericSearchInput({ value, onChange, onFocus, onBlur, ...props }: GenericSearchInputProps) {
  const showClear = value.length > 0;
  const [blockAutofill, setBlockAutofill] = useState(true);

  return (
    <Box position="relative" w="full">
      <GenericInput
        {...props}
        {...searchAutofillProps}
        value={value}
        onChange={e => onChange(e.target.value)}
        pe={showClear ? 10 : undefined}
        readOnly={blockAutofill}
        onFocus={e => {
          setBlockAutofill(false);
          onFocus?.(e);
        }}
        onBlur={e => {
          setBlockAutofill(true);
          onBlur?.(e);
        }}
      />
      {showClear ? (
        <IconButton
          aria-label="Limpiar búsqueda"
          type="button"
          variant="ghost"
          size="sm"
          position="absolute"
          top="50%"
          right={1.5}
          transform="translateY(-50%)"
          minW="8"
          h="8"
          color="gray.500"
          borderRadius="md"
          _hover={{ color: 'gray.700', bg: 'gray.100' }}
          onClick={() => onChange('')}
        >
          <FontAwesomeIcon icon={faXmark} style={{ width: '0.875rem', height: '0.875rem' }} />
        </IconButton>
      ) : null}
    </Box>
  );
}
