import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { GenericText } from '@/components/ui';
import { formatBs, formatUsd } from '@/lib/money';

type SummaryAmountHeaderProps = {
  label: string;
  amountUsd: number;
  amountBs: number;
  headerRight?: ReactNode;
  footerBorder?: boolean;
};

export function SummaryAmountHeader({
  label,
  amountUsd,
  amountBs,
  headerRight,
  footerBorder = false,
}: SummaryAmountHeaderProps) {
  return (
    <Box
      bg="gray.50"
      px={3}
      py={2.5}
      borderBottomWidth={footerBorder ? '1px' : undefined}
      borderColor="gray.100"
    >
      <Flex justify="space-between" align="center" gap={2}>
        <GenericText variant="label" fontSize="xs">
          {label}
        </GenericText>
        {headerRight != null && headerRight !== '' ? (
          <GenericText variant="caption">{headerRight}</GenericText>
        ) : null}
      </Flex>
      <GenericText variant="price" fontSize={{ base: 'md', md: 'lg' }} mt={1} lineHeight="short">
        {formatUsd(amountUsd)} · {formatBs(amountBs)}
      </GenericText>
    </Box>
  );
}

export function SummaryAmountCard(props: SummaryAmountHeaderProps) {
  return (
    <Box bg="white" borderRadius="md" borderWidth="1px" overflow="hidden">
      <SummaryAmountHeader {...props} />
    </Box>
  );
}
