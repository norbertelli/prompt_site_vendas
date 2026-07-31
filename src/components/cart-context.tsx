"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "psv_cart";

type CartState = {
  hydrated: boolean;
  items: CartItem[];
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ hydrated: false, items: [] });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    queueMicrotask(() => {
      setState((prev) => ({
        hydrated: true,
        items: raw ? (JSON.parse(raw) as CartItem[]) : prev.items,
      }));
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.hydrated, state.items]);

  const addItem = useCallback((item: CartItem) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.id === item.id);
      const items = existing
        ? prev.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          )
        : [...prev.items, item];
      return { ...prev, items };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      items:
        quantity <= 0
          ? prev.items.filter((i) => i.id !== id)
          : prev.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
  }, []);

  const clearCart = useCallback(
    () => setState((prev) => ({ ...prev, items: [] })),
    []
  );

  const value = useMemo(() => {
    const count = state.items.reduce((acc, i) => acc + i.quantity, 0);
    const total = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return {
      items: state.items,
      count,
      total,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    };
  }, [state.items, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
