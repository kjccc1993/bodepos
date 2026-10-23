import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartLine } from '@/lib/types';

const SLOTS = [1, 2, 3] as const;
export type CartSlot = (typeof SLOTS)[number];

type Carts = Record<CartSlot, CartLine[]>;

const empty: Carts = { 1: [], 2: [], 3: [] };

function loadCarts(): Carts {
  try {
    const raw = localStorage.getItem('bodepos_carts');
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return { ...empty };
  }
}

type CartContextValue = {
  activeSlot: CartSlot;
  setActiveSlot: (s: CartSlot) => void;
  lines: CartLine[];
  addLine: (line: Omit<CartLine, 'quantity'>, qty?: number) => void;
  /** Cantidad absoluta en carrito (0 = quitar línea). */
  setProductQuantity: (line: Omit<CartLine, 'quantity'>, quantity: number) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  /** Cantidad de productos distintos en el carrito activo (no suma unidades/gramos). */
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [activeSlot, setActiveSlotState] = useState<CartSlot>(1);
  const [carts, setCarts] = useState<Carts>(loadCarts);

  const persist = useCallback((next: Carts) => {
    setCarts(next);
    localStorage.setItem('bodepos_carts', JSON.stringify(next));
  }, []);

  const setActiveSlot = useCallback((s: CartSlot) => setActiveSlotState(s), []);

  const lines = carts[activeSlot];

  const addLine = useCallback(
    (line: Omit<CartLine, 'quantity'>, qty = 1) => {
      const slotLines = [...carts[activeSlot]];
      const idx = slotLines.findIndex(l => l.productId === line.productId);
      if (idx >= 0) slotLines[idx] = { ...slotLines[idx], quantity: slotLines[idx].quantity + qty };
      else slotLines.push({ ...line, quantity: qty });
      persist({ ...carts, [activeSlot]: slotLines });
    },
    [activeSlot, carts, persist],
  );

  const setProductQuantity = useCallback(
    (line: Omit<CartLine, 'quantity'>, quantity: number) => {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        persist({ ...carts, [activeSlot]: carts[activeSlot].filter(l => l.productId !== line.productId) });
        return;
      }
      const slotLines = [...carts[activeSlot]];
      const idx = slotLines.findIndex(l => l.productId === line.productId);
      if (idx >= 0) slotLines[idx] = { ...slotLines[idx], quantity };
      else slotLines.push({ ...line, quantity });
      persist({ ...carts, [activeSlot]: slotLines });
    },
    [activeSlot, carts, persist],
  );

  const updateQty = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        persist({ ...carts, [activeSlot]: carts[activeSlot].filter(l => l.productId !== productId) });
        return;
      }
      const slotLines = carts[activeSlot].map(l => (l.productId === productId ? { ...l, quantity } : l));
      persist({ ...carts, [activeSlot]: slotLines });
    },
    [activeSlot, carts, persist],
  );

  const removeLine = useCallback(
    (productId: string) => {
      persist({ ...carts, [activeSlot]: carts[activeSlot].filter(l => l.productId !== productId) });
    },
    [activeSlot, carts, persist],
  );

  const clearCart = useCallback(() => {
    persist({ ...carts, [activeSlot]: [] });
  }, [activeSlot, carts, persist]);

  const itemCount = lines.length;

  const value = useMemo(
    () => ({ activeSlot, setActiveSlot, lines, addLine, setProductQuantity, updateQty, removeLine, clearCart, itemCount }),
    [activeSlot, setActiveSlot, lines, addLine, setProductQuantity, updateQty, removeLine, clearCart, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside provider');
  return ctx;
}
