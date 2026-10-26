import { Box, Flex, Text } from '@chakra-ui/react';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreSettings } from '@/lib/api/hooks';

/** Bloque de perfil en sidebar: nombre de la bodega desde la tienda. */
export function SidebarUserBlock() {
  const { data: settings } = useStoreSettings();
  const storeName = settings?.name?.trim() || 'BodePOS';

  return (
    <Flex align="center" gap={3} px={1} py={1}>
      <Flex
        align="center"
        justify="center"
        flexShrink={0}
        w="11"
        h="11"
        borderRadius="full"
        bg="gray.200"
        color="gray.600"
        overflow="hidden"
      >
        <FontAwesomeIcon icon={faUser} style={{ width: '1.125rem', height: '1.125rem' }} />
      </Flex>
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="bold" color="gray.900" lineClamp={1} title={storeName}>
          {storeName}
        </Text>
        <Text fontSize="xs" color="gray.500" lineClamp={1} mt={0.5}>
          Punto de venta
        </Text>
      </Box>
    </Flex>
  );
}
