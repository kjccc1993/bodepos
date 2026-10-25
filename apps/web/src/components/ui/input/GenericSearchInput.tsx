import { Box, IconButton } from '@chakra-ui/react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericInput, type GenericInputProps } from '@/components/ui/input/GenericInput';

export type GenericSearchInputProps = Omit<GenericInputProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

export function GenericSearchInput({ value, onChange, ...props }: GenericSearchInputProps) {
  const showClear = value.length > 0;

  return (
    <Box position="relative" w="full">
      <GenericInput
        value={value}
        onChange={e => onChange(e.target.value)}
        pe={showClear ? 10 : undefined}
        {...props}
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
