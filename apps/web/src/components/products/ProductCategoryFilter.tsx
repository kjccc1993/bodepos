import { Box, Button, Flex, useBreakpointValue } from '@chakra-ui/react';
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
      overflowX={{ base: 'auto', md: 'visible' }}
      overscrollBehaviorX="contain"
      mx={{ base: -1, md: 0 }}
      px={{ base: 1, md: 0 }}
      py={{ base: 1, md: 2 }}
    >
      <Flex
        gap={{ base: 2, md: 3 }}
        w={{ base: 'max-content', md: 'full' }}
        minW={{ base: 'full', md: 'auto' }}
        flexWrap={{ base: 'nowrap', md: 'wrap' }}
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
      size={{ base: 'sm', md: 'md' }}
      flexShrink={0}
      borderRadius="full"
      fontWeight="medium"
      px={{ base: 4, md: 5 }}
      h={{ base: 8, md: 10 }}
      minH={{ base: 8, md: 10 }}
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
