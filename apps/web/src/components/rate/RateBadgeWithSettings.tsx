import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
  chakra,
} from '@chakra-ui/react';
import { useState } from 'react';
import { RateSettingsForm } from '@/components/rate/RateSettingsForm';
import { useStoreSettings } from '@/lib/api/hooks';
import { effectiveRate } from '@/lib/rate';

const RateBadgeButton = chakra('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
    maxW: '100%',
    px: '2.5',
    py: '1.5',
    borderRadius: 'full',
    bg: 'blue.50',
    borderWidth: '1px',
    borderColor: 'blue.200',
    color: 'blue.900',
    cursor: 'pointer',
    font: 'inherit',
    transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: '0 1px 2px rgba(30, 64, 175, 0.06)',
    _hover: {
      bg: 'blue.100',
      borderColor: 'blue.300',
      boxShadow: '0 2px 6px rgba(30, 64, 175, 0.1)',
    },
    _active: {
      bg: 'blue.200',
      transform: 'scale(0.98)',
    },
  },
});

export function RateBadgeWithSettings() {
  const { data: settings } = useStoreSettings();
  const rate = effectiveRate(settings);
  const [open, setOpen] = useState(false);

  const rateLabel = rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <RateBadgeButton
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Tasa: 1 dólar igual a ${rateLabel} bolívares. Toca para configurar`}
      >
        <Text fontSize="sm" fontWeight="bold" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
          1$ = {rateLabel}
        </Text>

        <Box w="1px" alignSelf="stretch" my={0.5} bg="blue.200" flexShrink={0} aria-hidden />

        <Flex
          align="center"
          justify="center"
          w="7"
          h="7"
          borderRadius="full"
          bg="blue.100"
          color="blue.700"
          flexShrink={0}
          aria-hidden
        >
          <FontAwesomeIcon icon={faSliders} style={{ width: '0.75rem', height: '0.75rem' }} />
        </Flex>
      </RateBadgeButton>

      <Dialog.Root
        open={open}
        onOpenChange={e => setOpen(e.open)}
        placement="center"
        motionPreset="scale"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={4}>
            <Dialog.Content
              maxW="md"
              w="full"
              m="auto"
              borderRadius="lg"
              boxShadow="lg"
              display="flex"
              flexDirection="column"
            >
              <Dialog.Header
                flexShrink={0}
                borderBottomWidth="1px"
                borderColor="gray.200"
                py={3}
                px={4}
              >
                <Dialog.Title fontSize="lg" fontWeight="semibold">
                  Tasa de cambio
                </Dialog.Title>
                <Dialog.CloseTrigger asChild position="absolute" top={2} right={2}>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body flex="1" overflowY="auto" px={4} py={4}>
                <RateSettingsForm open={open} onClose={() => setOpen(false)} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
