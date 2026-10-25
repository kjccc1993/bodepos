import { Box, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { NavIcon } from '@/components/nav/NavIcons';
import { accountingNavLinks, isAccountingNavLinkActive } from '@/lib/nav/accounting-nav';
import { navItemActiveProps, navItemIdleProps } from '@/lib/design/surface-styles';

type Props = {
  pathname: string;
};

export function SidebarAccountingNav({ pathname }: Props) {
  return (
    <>
      {accountingNavLinks.map(link => {
        const active = isAccountingNavLinkActive(pathname, link.to);
        return (
          <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
            <Flex
              align="center"
              gap={3}
              px={4}
              py={3}
              borderRadius="lg"
              fontSize="sm"
              lineHeight="short"
              transition="background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease"
              {...(active ? navItemActiveProps : navItemIdleProps)}
              _hover={{
                bg: active ? 'white' : 'blackAlpha.50',
                borderColor: active ? 'gray.200' : 'transparent',
              }}
            >
              <Box flexShrink={0} lineHeight={0} w="6" display="flex" justifyContent="center">
                <NavIcon id={link.icon} active={active} />
              </Box>
              {link.label}
            </Flex>
          </Link>
        );
      })}
    </>
  );
}
