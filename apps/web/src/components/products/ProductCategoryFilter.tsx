import { Box, Button, Flex, useBreakpointValue } from '@chakra-ui/react';
import { FORM_CONTROL_BORDER_RADIUS } from '@/components/ui/form-control-metrics';
import type { ProductCategory } from '@/lib/types';

type Props = {
  categories: ProductCategory[];
  value: string;
  onChange: (categoryId: string) => void;
};

export function ProductCategoryFilter({ categories, value, onChange }: Props) {
  const showCounts = useBreakpointValue({ base: true, md: false }) ?? true;

  if (categories.length === 0) return null;

  return (
    <Box
      className="hide-scrollbar"
      overflowX="auto"
      overscrollBehaviorX="contain"
      mx={{ base: -1, md: 0 }}
      px={{ base: 1, md: 0 }}
      py={{ base: 1, md: 1.5 }}
    >
      <Flex
        gap={{ base: 1.5, md: 2 }}
        w="max-content"
        minW="full"
        flexWrap="nowrap"
        pb={{ base: 0.5, md: 0 }}
      >
        <FilterChip label="Todas" active={!value} onClick={() => onChange('')} />
        {categories.map(c => (
          <FilterChip
            key={c.id}
            label={showCounts && c.productCount != null ? `${c.name} (${c.productCount})` : c.name}
            active={value === c.id}
            onClick={() => onChange(c.id)}
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
