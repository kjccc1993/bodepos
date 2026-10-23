import { Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { NavIconCart } from '@/components/nav/NavIcons';

export function CartHeaderIcon({ itemCount }: { itemCount: number }) {
  const active = itemCount > 0;
  const label = itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito';

  return (
    <Link to="/cart" aria-label={label} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        justify="center"
        position="relative"
        w="11"
        h="11"
        borderRadius="md"
        color={active ? 'green.700' : 'gray.600'}
        _hover={{ bg: 'gray.100' }}
        _active={{ bg: 'gray.200' }}
      >
        <NavIconCart size={24} color={active ? '#15803d' : '#64748b'} />
        {itemCount > 0 && (
          <Flex
            position="absolute"
            top="0"
            right="0"
            minW="4.5"
            h="4.5"
            px={1}
            borderRadius="full"
            bg="green.600"
            color="white"
            fontSize="2xs"
            fontWeight="bold"
            align="center"
            justify="center"
            borderWidth="2px"
            borderColor="white"
            transform="translate(25%, -25%)"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Flex>
        )}
      </Flex>
    </Link>
  );
}
