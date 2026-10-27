import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Flex } from '@chakra-ui/react';
import { getPaymentMeta } from '@/components/payments/payment-meta';
import { GenericText } from '@/components/ui';

export type PaymentMetricTileData = {
  id: string;
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
};

export function PaymentMetricTile({
  metric,
  variant = 'default',
}: {
  metric: PaymentMetricTileData;
  variant?: 'default' | 'borderless';
}) {
  const { icon, colorPalette } = getPaymentMeta(metric.id);
  const muted = metric.muted ?? false;
  const bordered = variant !== 'borderless';
  const tileBg =
    bordered && metric.emphasize && !muted ? `${colorPalette}.50` : 'white';

  return (
    <Flex
      align="center"
      gap={2}
      px={2}
      py={1.5}
      minH="9"
      minW={0}
      w="full"
      overflow="hidden"
      borderRadius="md"
      borderWidth="1px"
      borderColor={
        bordered
          ? metric.emphasize
            ? `${colorPalette}.200`
            : 'gray.200'
          : 'gray.100'
      }
      bg={tileBg}
      boxShadow={metric.emphasize ? '0 1px 2px rgba(15, 23, 42, 0.04)' : 'none'}
    >
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
      <GenericText variant="caption" color="gray.600" lineClamp={1} flex="1" minW={0} fontSize="xs">
        {metric.label}
      </GenericText>
      <GenericText
        variant="strong"
        fontSize="xs"
        fontVariantNumeric="tabular-nums"
        flexShrink={0}
        color={muted ? 'gray.400' : 'gray.900'}
      >
        {metric.value}
      </GenericText>
    </Flex>
  );
}
