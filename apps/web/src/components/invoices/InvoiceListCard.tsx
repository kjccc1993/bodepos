import { Box, Flex, Stack } from '@chakra-ui/react';
import { GenericText } from '@/components/ui';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { formatInvoiceCreatedAtShort } from '@/lib/invoices/format';
import { formatBs, formatUsd } from '@/lib/money';
import type { Invoice } from '@/lib/types';

type Props = {
  invoice: Invoice;
  onOpen: () => void;
};

export function InvoiceListCard({ invoice, onOpen }: Props) {
  const customer = invoice.customerName ?? 'N/A';
  const productsLabel = invoice.lineCount === 1 ? '1 prod.' : `${invoice.lineCount} prod.`;

  return (
    <Box
      bg="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="soft"
      px={2.5}
      py={2}
      cursor="pointer"
      _hover={{ borderColor: 'gray.300', bg: 'gray.50' }}
      onClick={onOpen}
    >
      <Flex align="flex-start" gap={2}>
        <Stack flex="1" minW={0} gap={0.5}>
          <GenericText variant="strong" color="red.600" fontSize="xs" lineClamp={1}>
            Nro: {invoice.number}
          </GenericText>
          <GenericText variant="caption" lineClamp={1}>
            {formatInvoiceCreatedAtShort(invoice.createdAt)}
          </GenericText>
          <GenericText variant="caption" lineClamp={1}>
            {customer}
          </GenericText>
        </Stack>

        <Stack align="flex-end" gap={0.5} flexShrink={0} maxW="55%">
          <InvoiceStatusBadge status={invoice.status} />
          <GenericText
            variant="strong"
            fontSize="sm"
            textAlign="right"
            lineClamp={1}
            fontVariantNumeric="tabular-nums"
          >
            {formatUsd(invoice.totalUsd)}
          </GenericText>
          <GenericText
            variant="body"
            fontSize="xs"
            textAlign="right"
            lineClamp={1}
            fontVariantNumeric="tabular-nums"
          >
            {formatBs(invoice.totalBs)}
          </GenericText>
          <GenericText variant="caption" textAlign="right">
            {productsLabel}
          </GenericText>
        </Stack>
      </Flex>
    </Box>
  );
}
