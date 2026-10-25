import { Button, Dialog, Portal, Stack } from '@chakra-ui/react';
import { GenericText } from '@/components/ui';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function GenericConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  loading = false,
}: Props) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={e => onOpenChange(e.open)}
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner p={4}>
          <Dialog.Content maxW="sm" w="full" borderRadius="xl" borderWidth="1px" borderColor="gray.200" boxShadow="lift" bg="white">
            <Dialog.Header px={4} pt={4} pb={2}>
              <Dialog.Title fontSize="md" fontWeight="semibold">
                {title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body px={4} py={2}>
              <GenericText variant="body">{message}</GenericText>
            </Dialog.Body>
            <Dialog.Footer px={4} pb={4} pt={2} gap={2}>
              <Stack direction="row" w="full" gap={2}>
                <Button flex="1" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  {cancelLabel}
                </Button>
                <Button
                  flex="1"
                  colorPalette="red"
                  onClick={onConfirm}
                  loading={loading}
                  loadingText="Eliminando…"
                >
                  {confirmLabel}
                </Button>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
