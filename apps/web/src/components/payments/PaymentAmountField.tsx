import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Flex } from '@chakra-ui/react';
import { GenericText, MoneyAmountInput } from '@/components/ui';
import { getPaymentMeta } from '@/components/payments/payment-meta';

type Props = {
  paymentId: string;
  label: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
};

export function PaymentAmountField({ paymentId, label, id, value, onChange }: Props) {
  const { icon, colorPalette } = getPaymentMeta(paymentId);

  const iconBox = (
    <Flex
      boxSize={7}
      flexShrink={0}
      borderRadius="md"
      bg={`${colorPalette}.100`}
      color={`${colorPalette}.700`}
      align="center"
      justify="center"
    >
      <FontAwesomeIcon icon={icon} style={{ width: '0.75rem', height: '0.75rem' }} />
    </Flex>
  );

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'stretch', md: 'center' }}
      gap={2}
      px={2.5}
      py={2}
      minH={{ base: 'auto', md: '10' }}
      minW={0}
      w="full"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
    >
      <Box display={{ base: 'block', md: 'none' }} w="full">
        <label htmlFor={id} style={{ display: 'block', width: '100%', cursor: 'pointer' }}>
          <GenericText
            variant="caption"
            color="gray.600"
            fontSize="xs"
            whiteSpace="normal"
            wordBreak="break-word"
          >
            {label}
          </GenericText>
        </label>
      </Box>

      <Flex align="center" gap={2} flex={{ md: 1 }} minW={0} w="full">
        {iconBox}
        <Box display={{ base: 'none', md: 'block' }} flex="1" minW={0}>
          <label htmlFor={id} style={{ display: 'block', cursor: 'pointer' }}>
            <GenericText variant="caption" color="gray.600" fontSize="xs" lineClamp={2}>
              {label}
            </GenericText>
          </label>
        </Box>
        <MoneyAmountInput
          id={id}
          size="sm"
          flex={{ base: '1', md: '0 1 7.5rem' }}
          minW={0}
          w={{ base: 'auto', md: 'auto' }}
          maxW={{ md: '9rem' }}
          value={value}
          onChange={onChange}
        />
      </Flex>
    </Flex>
  );
}
