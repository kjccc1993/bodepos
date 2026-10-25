import { Flex, Text } from '@chakra-ui/react';
import type { Invoice } from '@/lib/types';
import { invoiceStatusLabel } from '@/lib/invoices/format';

const styles = {
  PAID: {
    bg: 'green.50',
    border: 'green.200',
    dot: 'green.500',
    text: 'green.800',
  },
  PENDING: {
    bg: 'orange.50',
    border: 'orange.200',
    dot: 'orange.500',
    text: 'orange.800',
  },
} as const;

export function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  const s = styles[status];
  return (
    <Flex
      align="center"
      gap={1.5}
      px={2}
      py={0.5}
      borderRadius="md"
      bg={s.bg}
      borderWidth="1px"
      borderColor={s.border}
      w="fit-content"
      flexShrink={0}
    >
      <Flex boxSize="1.5" borderRadius="full" bg={s.dot} flexShrink={0} />
      <Text fontSize="2xs" fontWeight="semibold" lineHeight="1.2" color={s.text}>
        {invoiceStatusLabel(status)}
      </Text>
    </Flex>
  );
}
