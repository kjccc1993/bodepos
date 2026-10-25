import { Button, CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { GenericInput, GenericText, MoneyAmountInput } from '@/components/ui';
import { useSaveCustomer } from '@/lib/api/hooks';
import type { Customer } from '@/lib/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
};

export function CustomerQuickCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const save = useSaveCustomer();
  const [name, setName] = useState('');
  const [debtUsd, setDebtUsd] = useState(0);
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setDebtUsd(0);
    setError('');
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Escribe el nombre del cliente');
      return;
    }
    setError('');
    try {
      const customer = await save.mutateAsync({ name: trimmed, debtUsd });
      onCreated(customer);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el cliente');
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={e => {
        if (!e.open) close();
      }}
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner p={4}>
          <Dialog.Content maxW="sm" w="full" borderRadius="lg" boxShadow="lg">
            <Dialog.Header flexShrink={0} borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}>
              <Dialog.Title fontSize="lg" fontWeight="semibold">
                Nuevo cliente
              </Dialog.Title>
              <Dialog.CloseTrigger asChild position="absolute" top={2} right={2}>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body px={4} py={4}>
              <Stack gap={3}>
                <GenericInput
                  size="sm"
                  placeholder="Nombre"
                  aria-label="Nombre del cliente"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
                <MoneyAmountInput
                  size="sm"
                  placeholder="Deuda inicial"
                  aria-label="Deuda inicial en USD"
                  value={debtUsd}
                  onChange={setDebtUsd}
                />
                {error && <GenericText variant="error">{error}</GenericText>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer gap={2} px={4} py={3} borderTopWidth="1px" borderColor="gray.200">
              <Button flex={1} variant="outline" onClick={close}>
                Cancelar
              </Button>
              <Button flex={1} colorPalette="green" loading={save.isPending} onClick={submit}>
                Guardar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
