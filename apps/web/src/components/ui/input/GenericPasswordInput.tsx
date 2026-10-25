import { Box, IconButton } from '@chakra-ui/react';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { GenericInput, type GenericInputProps } from '@/components/ui/input/GenericInput';

export type GenericPasswordInputProps = Omit<GenericInputProps, 'type'>;

export function GenericPasswordInput(props: GenericPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Box position="relative" w="full">
      <GenericInput
        {...props}
        type={visible ? 'text' : 'password'}
        pe={10}
        autoComplete={props.autoComplete ?? 'current-password'}
      />
      <IconButton
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
        onClick={() => setVisible(v => !v)}
      >
        <FontAwesomeIcon
          icon={visible ? faEyeSlash : faEye}
          style={{ width: '0.875rem', height: '0.875rem' }}
        />
      </IconButton>
    </Box>
  );
}
