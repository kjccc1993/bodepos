import { Box, Flex } from '@chakra-ui/react';
import { useMemo } from 'react';
import { ProductCategoryFilter } from '@/components/products/ProductCategoryFilter';
import { GenericSearchInput, GenericSelect } from '@/components/ui';
import type { ProductCategory } from '@/lib/types';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: ProductCategory[];
  searchBoxShadow?: string;
};

export function ProductSearchWithCategory({
  search,
  onSearchChange,
  searchPlaceholder,
  categoryId,
  onCategoryChange,
  categories,
  searchBoxShadow = 'sm',
}: Props) {
  const categoryOptions = useMemo(
    () => [{ value: '', label: 'Todas' }, ...categories.map(c => ({ value: c.id, label: c.name }))],
    [categories],
  );

  return (
    <>
      <Flex gap={2} align="stretch" display={{ base: 'flex', md: 'none' }}>
        <Box flex="7" minW={0}>
          <GenericSearchInput
            placeholder={searchPlaceholder}
            value={search}
            onChange={onSearchChange}
            size="lg"
            h="12"
            boxShadow={searchBoxShadow}
          />
        </Box>
        <Box flex="3" minW={0}>
          <GenericSelect
            options={categoryOptions}
            value={categoryId}
            onChange={onCategoryChange}
            placeholder="Todas"
            size="lg"
            aria-label="Categoría"
            menuMinWidth="19rem"
            menuPlacement="bottom-end"
          />
        </Box>
      </Flex>

      <Box display={{ base: 'none', md: 'block' }}>
        <GenericSearchInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={onSearchChange}
          size="lg"
          h="12"
          boxShadow={searchBoxShadow}
        />
        <Box mt={1.5}>
          <ProductCategoryFilter categories={categories} value={categoryId} onChange={onCategoryChange} />
        </Box>
      </Box>
    </>
  );
}
