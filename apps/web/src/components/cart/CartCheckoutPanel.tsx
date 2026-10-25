import { Box, Button, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { PayCheckoutDialog } from '@/components/cart/PayCheckoutDialog';
import { GenericText } from '@/components/ui';
import { formatBs, formatUsd } from '@/lib/money';

type Props = {
  totalUsd: number;
  totalBs: number;
  onClear: () => void;
  /** En columna lateral (Vender md+): sin sombra superior. */
  variant?: 'footer' | 'sidebar';
  payDisabled?: boolean;
};

export function CartCheckoutPanel({
  totalUsd,
  totalBs,
  onClear,
  variant = 'footer',
  payDisabled = false,
}: Props) {
  const isSidebar = variant === 'sidebar';
  const [payOpen, setPayOpen] = useState(false);

  return (
    <>
      <Box
      flex={{ base: '0 0 auto', md: isSidebar ? '0 0 auto' : '1' }}
      flexShrink={0}
      minW={0}
      px={3}
      py={3}
      pb={{ base: 4, md: 3 }}
      bg="white"
      borderTopWidth="1px"
      borderLeftWidth={{ base: '0', md: isSidebar ? '0' : '1px' }}
      borderColor="gray.200"
      boxShadow={isSidebar ? 'none' : { base: '0 -4px 12px rgba(15, 23, 42, 0.06)', md: 'none' }}
      display="flex"
      flexDirection="column"
    >
      <Box mb={3} p={3} bg="gray.50" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
        <Flex justify="space-between" align="baseline" gap={2}>
          <GenericText variant="label">Total USD</GenericText>
          <GenericText variant="price" fontSize="lg">
            {formatUsd(totalUsd)}
          </GenericText>
        </Flex>
        <Flex justify="space-between" align="baseline" gap={2} mt={1}>
          <GenericText variant="label">Total Bs</GenericText>
          <GenericText variant="strong" fontSize="md" fontVariantNumeric="tabular-nums">
            {formatBs(totalBs)}
          </GenericText>
        </Flex>
      </Box>

      <Flex gap={2} align="stretch" mt={isSidebar ? 0 : { md: 'auto' }}>
        <Button
          flex="1"
          minW={0}
          size="lg"
          minH="12"
          py={3}
          variant="outline"
          colorPalette="red"
          bg="red.50"
          borderColor="red.200"
          color="red.700"
          _hover={{ bg: 'red.100' }}
          onClick={onClear}
          disabled={totalUsd <= 0}
        >
          Vaciar
        </Button>
        <Button
          flex="1"
          minW={0}
          size="lg"
          minH="12"
          py={3}
          colorPalette="green"
          disabled={payDisabled}
          onClick={() => setPayOpen(true)}
        >
          Ir a pagar
        </Button>
      </Flex>
      </Box>
      <PayCheckoutDialog open={payOpen} onClose={() => setPayOpen(false)} />
    </>
  );
}
