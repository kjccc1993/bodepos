import { Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { NavIconCart } from '@/components/nav/NavIcons';

export function CartHeaderIcon({ itemCount }: { itemCount: number }) {
  const active = itemCount > 0;
  const label = itemCount > 0 ? `Carrito, ${itemCount} productos` : 'Carrito';
  const badgeText = itemCount > 99 ? '99+' : String(itemCount);
  const badgeWide = badgeText.length > 1;

  return (
    <Link to="/cart" aria-label={label} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        justify="center"
        position="relative"
        flexShrink={0}
        w="9"
        h="9"
        minW="9"
        borderRadius="lg"
        borderWidth="1px"
        borderColor={active ? 'green.200' : 'gray.200'}
        bg={active ? 'green.50' : 'white'}
        color={active ? 'green.700' : 'gray.600'}
        boxShadow="card"
        _hover={{ bg: active ? 'green.100' : 'gray.50' }}
        _active={{ bg: active ? 'green.100' : 'gray.100' }}
      >
        <NavIconCart size={20} color={active ? '#16a34a' : '#64748b'} />
        {itemCount > 0 && (
          <Flex
            position="absolute"
            top="-1"
            right="-1"
            minW={badgeWide ? '4.5' : '4.5'}
            h="4.5"
            px={badgeWide ? 0.5 : 0}
            borderRadius="full"
            bg="green.600"
            color="white"
            align="center"
            justify="center"
            borderWidth="1px"
            borderColor="white"
            pointerEvents="none"
          >
            <Text
              as="span"
              fontSize="10px"
              lineHeight="1"
              fontWeight="semibold"
              fontVariantNumeric="tabular-nums"
            >
              {badgeText}
            </Text>
          </Flex>
        )}
      </Flex>
    </Link>
  );
}
