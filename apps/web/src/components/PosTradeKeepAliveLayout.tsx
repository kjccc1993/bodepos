import { Flex } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ProductsPage } from '@/pages/ProductsPage';
import { SellPage } from '@/pages/SellPage';
import { prefetchDefaultProductLists } from '@/lib/hooks/useInfiniteProductList';
import { SellTabActiveContext } from '@/lib/trade/TradeTabContext';

const SellPagePanel = memo(SellPage);
const ProductsPagePanel = memo(ProductsPage);

const panelProps = (visible: boolean) =>
  ({
    position: 'absolute',
    inset: 0,
    direction: 'column',
    flex: 1,
    minH: 0,
    minW: 0,
    visibility: visible ? 'visible' : 'hidden',
    pointerEvents: visible ? 'auto' : 'none',
    contain: 'strict',
    'aria-hidden': !visible,
  }) as const;

/** Mantiene Vender y Productos montados al alternar tabs (cambio instantáneo). */
export function PosTradeKeepAliveLayout() {
  const { pathname } = useLocation();
  const onSell = pathname === '/sell';
  const onProducts = pathname === '/products';
  const qc = useQueryClient();

  useEffect(() => {
    prefetchDefaultProductLists(qc);
  }, [qc]);

  return (
    <Flex direction="column" flex="1" minH={0} minW={0} w="full" position="relative">
      <SellTabActiveContext.Provider value={onSell}>
        <Flex {...panelProps(onSell)}>
          <SellPagePanel />
        </Flex>
      </SellTabActiveContext.Provider>
      <Flex {...panelProps(onProducts)}>
        <ProductsPagePanel />
      </Flex>
      <Outlet />
    </Flex>
  );
}
