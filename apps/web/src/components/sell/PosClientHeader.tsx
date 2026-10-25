import { Box, Flex } from '@chakra-ui/react';
import { BackChevronLink } from '@/components/nav/BackChevronLink';
import { CartHeaderIcon } from '@/components/nav/CartHeaderIcon';
import { RateBadgeWithSettings } from '@/components/rate/RateBadgeWithSettings';
import { GenericHeading } from '@/components/ui';

type Props = {
  title: string;
  itemCount: number;
  /** Oculta el acceso al carrito desde md (p. ej. factura en pantalla en Vender). */
  hideCartIconFromMd?: boolean;
  /** En móvil, chevron para volver (p. ej. carrito → Vender). */
  backTo?: string;
  backAriaLabel?: string;
};

export function PosClientHeader({
  title,
  itemCount,
  hideCartIconFromMd = false,
  backTo,
  backAriaLabel = 'Volver',
}: Props) {
  return (
    <Box
      flexShrink={0}
      w="full"
      px={{ base: 3, lg: 5 }}
      pt={{ base: 3, lg: 4 }}
      pb={2}
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
    >
      <Flex justify="space-between" align="center" gap={2}>
        <Flex align="center" gap={1.5} minW={0} flex="1">
          {backTo ? <BackChevronLink to={backTo} aria-label={backAriaLabel} /> : null}
          <GenericHeading lineClamp={1} minW={0}>
            {title}
          </GenericHeading>
        </Flex>
        <Flex gap={1.5} align="center" flexShrink={0}>
          <RateBadgeWithSettings />
          <Box display={hideCartIconFromMd ? { base: 'block', md: 'none' } : 'block'}>
            <CartHeaderIcon itemCount={itemCount} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
