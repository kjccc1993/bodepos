import { IconButton } from '@chakra-ui/react';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

type Props = {
  to: string;
  'aria-label'?: string;
};

export function BackChevronLink({ to, 'aria-label': ariaLabel = 'Volver' }: Props) {
  return (
    <IconButton variant="ghost" size="sm" minW="8" h="8" flexShrink={0} colorPalette="gray" asChild>
      <Link to={to} aria-label={ariaLabel}>
        <FontAwesomeIcon icon={faChevronLeft} style={{ width: '0.875rem', height: '0.875rem' }} />
      </Link>
    </IconButton>
  );
}
