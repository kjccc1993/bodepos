import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { GenericText } from '@/components/ui';
import { DaySummaryCardShell } from '@/components/ui/DaySummaryCardShell';
import { formatBs, formatUsd } from '@/lib/money';

type SummaryAmountHeaderProps = {
  label: string;
  amountUsd: number;
  amountBs: number;
  headerRight?: ReactNode;
  trailingActions?: ReactNode;
  footerBorder?: boolean;
};

export function SummaryAmountHeader({
  label,
  amountUsd,
  amountBs,
  headerRight,
  trailingActions,
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
        <Box flex="1" minW={0}>
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
        {trailingActions != null ? (
          <Flex flexShrink={0} gap="10px" align="stretch" alignSelf="center">
            {trailingActions}
          </Flex>
        ) : null}
      </Flex>
    </Box>
  );
}

export function SummaryAmountCard(props: SummaryAmountHeaderProps) {
  return (
    <DaySummaryCardShell>
      <SummaryAmountHeader {...props} />
    </DaySummaryCardShell>
  );
}
