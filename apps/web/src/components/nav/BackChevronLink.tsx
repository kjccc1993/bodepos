import { Box, IconButton } from '@chakra-ui/react';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

type Props = {
  to: string;
  'aria-label'?: string;
  /** Oculto en desktop cuando el sidenav está visible (`lg`). */
  hideFromLg?: boolean;
};

export function BackChevronLink({
  to,
  'aria-label': ariaLabel = 'Volver',
  hideFromLg = true,
}: Props) {
  const control = (
    <IconButton variant="ghost" size="sm" minW="8" h="8" flexShrink={0} colorPalette="gray" asChild>
      <Link to={to} aria-label={ariaLabel}>
        <FontAwesomeIcon icon={faChevronLeft} style={{ width: '0.875rem', height: '0.875rem' }} />
      </Link>
    </IconButton>
  );

  if (!hideFromLg) return control;

  return (
    <Box display={{ base: 'inline-flex', lg: 'none' }} flexShrink={0}>
      {control}
    </Box>
  );
}
