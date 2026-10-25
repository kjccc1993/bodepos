import { Box, Flex } from '@chakra-ui/react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericText } from '@/components/ui';
import { formatBs, formatUsd } from '@/lib/money';
import type { Customer } from '@/lib/types';

type Props = {
  customer: Customer;
  onOpen: () => void;
};

export function CustomerListCard({ customer, onOpen }: Props) {
  const hasDebt = customer.debtUsd > 0;

  return (
    <Box
      w="full"
      textAlign="left"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      p={{ base: 2, md: 2.5 }}
      cursor="pointer"
      _hover={{ borderColor: 'gray.300', bg: 'gray.50' }}
      onClick={onOpen}
    >
      <Flex align="center" justify="space-between" gap={2} minW={0}>
        <Box flex="1" minW={0}>
          <GenericText variant="strong" fontSize="sm" lineClamp={1}>
            {customer.name}
          </GenericText>
          <GenericText
            variant="body"
            fontSize="xs"
            mt={0.5}
            color={hasDebt ? 'orange.700' : 'gray.600'}
            fontWeight={hasDebt ? 'medium' : 'normal'}
          >
            {formatUsd(customer.debtUsd)} · {formatBs(customer.debtBs)}
          </GenericText>
        </Box>
        <FontAwesomeIcon
          icon={faChevronRight}
          style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0, color: '#64748b' }}
        />
      </Flex>
    </Box>
  );
}
