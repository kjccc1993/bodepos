import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Portal, Tooltip } from '@chakra-ui/react';
import type { MouseEvent } from 'react';
import { outlineIconButtonProps } from '@/lib/design/surface-styles';

type Props = {
  ariaLabel: string;
  onClick: (e: MouseEvent) => void;
};

export function DailyIncomeDeleteButton({ ariaLabel, onClick }: Props) {
  return (
    <Tooltip.Root openDelay={350} closeDelay={80}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={ariaLabel}
          w="10"
          h="10"
          minW="10"
          flexShrink={0}
          onClick={onClick}
          {...outlineIconButtonProps('danger')}
        >
          <FontAwesomeIcon icon={faTrash} style={{ width: '0.9375rem', height: '0.9375rem' }} />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content px={2} py={1} fontSize="xs">
            Eliminar registro
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
