import { IconButton, Portal, Tooltip } from '@chakra-ui/react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  label: string;
  icon: IconDefinition;
  onClick: () => void;
  colorPalette: 'blue' | 'green' | 'orange';
  /** Esquinas al unir botones en grupo (pegados). */
  borderRadius?: string;
};

export function ProductCardActionIcon({
  label,
  icon,
  onClick,
  colorPalette,
  borderRadius = 'md',
}: Props) {
  return (
    <Tooltip.Root openDelay={350} closeDelay={80}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={label}
          variant="solid"
          colorPalette={colorPalette}
          w="9"
          h="9"
          minW="9"
          borderRadius={borderRadius}
          onClick={onClick}
        >
          <FontAwesomeIcon icon={icon} style={{ width: '0.875rem', height: '0.875rem' }} />
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
