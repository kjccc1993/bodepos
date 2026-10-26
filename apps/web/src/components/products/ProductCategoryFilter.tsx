import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, useBreakpointValue } from '@chakra-ui/react';
import { FORM_CONTROL_BORDER_RADIUS } from '@/components/ui/form-control-metrics';
import type { ProductCategory } from '@/lib/types';

const DRAG_CLICK_THRESHOLD_PX = 5;

type Props = {
  categories: ProductCategory[];
  value: string;
  onChange: (categoryId: string) => void;
};

export function ProductCategoryFilter({ categories, value, onChange }: Props) {
  const showCounts = useBreakpointValue({ base: true, md: false }) ?? true;
  const dragScrollEnabled = useBreakpointValue({ base: false, md: true }) ?? false;

  const scrollRef = useRef<HTMLDivElement>(null);
  const suppressChipClickRef = useRef(false);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const [isGrabbing, setIsGrabbing] = useState(false);

  const endDrag = useCallback((pointerId: number) => {
    const el = scrollRef.current;
    if (dragRef.current.pointerId !== pointerId) return;

    if (dragRef.current.moved) {
      suppressChipClickRef.current = true;
    }

    dragRef.current.pointerId = -1;
    dragRef.current.moved = false;
    setIsGrabbing(false);

    if (el?.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
  }, []);

  const onScrollPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragScrollEnabled || e.pointerType !== 'mouse' || e.button !== 0) return;

      const el = scrollRef.current;
      if (!el) return;

      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startScrollLeft: el.scrollLeft,
        moved: false,
      };
      el.setPointerCapture(e.pointerId);
      setIsGrabbing(true);
    },
    [dragScrollEnabled],
  );

  const onScrollPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    if (!dragRef.current.moved && Math.abs(dx) <= DRAG_CLICK_THRESHOLD_PX) return;

    dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startScrollLeft - dx;
  }, []);

  const onScrollPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e.pointerId);
    },
    [endDrag],
  );

  const onScrollPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e.pointerId);
    },
    [endDrag],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !dragScrollEnabled) return;

    const onWheel = (e: WheelEvent) => {
      const horizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horizontalIntent ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
      const scrollingLeft = delta < 0;
      const scrollingRight = delta > 0;
      if ((scrollingLeft && !canScrollLeft) || (scrollingRight && !canScrollRight)) return;

      e.preventDefault();
      el.scrollLeft += delta;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [dragScrollEnabled, categories.length]);

  const handleChipClick = useCallback(
    (categoryId: string) => {
      if (suppressChipClickRef.current) {
        suppressChipClickRef.current = false;
        return;
      }
      onChange(categoryId);
    },
    [onChange],
  );

  if (categories.length === 0) return null;

  return (
    <Box
      ref={scrollRef}
      className="hide-scrollbar"
      overflowX="auto"
      overscrollBehaviorX="contain"
      mx={{ base: -1, md: 0 }}
      px={{ base: 1, md: 0 }}
      py={{ base: 1, md: 1.5 }}
      cursor={dragScrollEnabled ? (isGrabbing ? 'grabbing' : 'grab') : undefined}
      userSelect={isGrabbing ? 'none' : undefined}
      onPointerDown={onScrollPointerDown}
      onPointerMove={onScrollPointerMove}
      onPointerUp={onScrollPointerUp}
      onPointerCancel={onScrollPointerCancel}
    >
      <Flex
        gap={{ base: 1.5, md: 2 }}
        w="max-content"
        minW="full"
        flexWrap="nowrap"
        pb={{ base: 0.5, md: 0 }}
      >
        <FilterChip label="Todas" active={!value} onClick={() => handleChipClick('')} />
        {categories.map(c => (
          <FilterChip
            key={c.id}
            label={showCounts && c.productCount != null ? `${c.name} (${c.productCount})` : c.name}
            active={value === c.id}
            onClick={() => handleChipClick(c.id)}
          />
        ))}
      </Flex>
    </Box>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      flexShrink={0}
      borderRadius={FORM_CONTROL_BORDER_RADIUS}
      fontWeight="medium"
      fontSize={{ base: 'xs', md: 'sm' }}
      px={{ base: 3, md: 3.5 }}
      h={7}
      minH={7}
      borderWidth="1px"
      borderColor={active ? 'brand.500' : 'gray.200'}
      bg={active ? 'brand.500' : 'white'}
      color={active ? 'white' : 'gray.700'}
      boxShadow={active ? 'none' : '0 1px 2px rgba(15, 23, 42, 0.04)'}
      _hover={{
        bg: active ? 'brand.600' : 'gray.50',
        borderColor: active ? 'brand.600' : 'gray.300',
      }}
      _active={{ bg: active ? 'brand.700' : 'gray.100' }}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
