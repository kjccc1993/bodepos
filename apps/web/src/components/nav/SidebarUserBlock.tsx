import { Box, Flex, Text } from '@chakra-ui/react';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/** Bloque de perfil en sidebar (solo presentación, sin datos de usuario en API). */
export function SidebarUserBlock() {
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
        <Text fontSize="sm" fontWeight="bold" color="gray.900" lineClamp={1}>
          BodePOS
        </Text>
        <Text fontSize="xs" color="gray.500" lineClamp={1} mt={0.5}>
          Punto de venta
        </Text>
      </Box>
    </Flex>
  );
}
