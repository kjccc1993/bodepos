import { Button, Flex } from '@chakra-ui/react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { GenericText } from '@/components/ui';

type Props = {
  to: string;
  label: string;
};

export function NavChevronButton({ to, label }: Props) {
  return (
    <Button
      variant="outline"
      w="full"
      h="auto"
      minH="10"
      py={3}
      px={3}
      bg="white"
      borderColor="gray.200"
      fontWeight="medium"
      color="gray.900"
      _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
      asChild
    >
      <Link to={to}>
        <Flex align="center" justify="space-between" w="full" gap={3}>
          <GenericText variant="body" fontWeight="medium" textAlign="left">
            {label}
          </GenericText>
          <FontAwesomeIcon
            icon={faChevronRight}
            style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0, color: '#64748b' }}
          />
        </Flex>
      </Link>
    </Button>
  );
}
