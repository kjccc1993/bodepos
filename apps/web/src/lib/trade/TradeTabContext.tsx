import { createContext, useContext } from 'react';

export const SellTabActiveContext = createContext(true);

export function useSellTabActive() {
  return useContext(SellTabActiveContext);
}
