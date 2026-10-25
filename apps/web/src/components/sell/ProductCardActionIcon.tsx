import { IconButton, Portal, Tooltip } from '@chakra-ui/react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { outlineIconButtonProps } from '@/lib/design/surface-styles';

type Props = {
  label: string;
  icon: IconDefinition;
  onClick: () => void;
  /** primary = verde, secondary = naranja */
  tone?: 'primary' | 'secondary';
};

export function ProductCardActionIcon({ label, icon, onClick, tone = 'secondary' }: Props) {
  const outline = outlineIconButtonProps(tone);

  return (
    <Tooltip.Root openDelay={350} closeDelay={80}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={label}
          w="10"
          h="10"
          minW="10"
          onClick={onClick}
          {...outline}
        >
          <FontAwesomeIcon icon={icon} style={{ width: '0.9375rem', height: '0.9375rem' }} />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content px={2} py={1} fontSize="xs">
            {label}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
