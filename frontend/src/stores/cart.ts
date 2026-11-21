"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string | null;
  unitPrice: number;
  quantity: number;
  maxQty: number;
};

type CartState = {
  lines: CartLine[];
  open: boolean;
  bump: number;
  couponCode: string;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  replace: (lines: CartLine[]) => void;
  setOpen: (open: boolean) => void;
  setCoupon: (code: string) => void;
};

export const MAX_PER_LINE = 10;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      bump: 0,
      couponCode: "",
      add: (line, qty = 1) => {
        const lines = [...get().lines];
        const i = lines.findIndex((l) => l.variantId === line.variantId);
        const cap = Math.min(MAX_PER_LINE, line.maxQty);
        if (i >= 0) lines[i] = { ...lines[i], ...line, quantity: Math.min(cap, lines[i].quantity + qty) };
        else lines.unshift({ ...line, quantity: Math.min(cap, qty) });
        set({ lines, bump: get().bump + 1 });
      },
      setQty: (variantId, qty) =>
        set({
          lines: get().lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(1, Math.min(Math.min(MAX_PER_LINE, l.maxQty), qty)) } : l)),
        }),
      remove: (variantId) => set({ lines: get().lines.filter((l) => l.variantId !== variantId) }),
      clear: () => set({ lines: [], couponCode: "" }),
      replace: (lines) => set({ lines }),
      setOpen: (open) => set({ open }),
      setCoupon: (couponCode) => set({ couponCode }),
    }),
    {
      name: "kt-cart",
      version: 1,
      partialize: (s) => ({ lines: s.lines, couponCode: s.couponCode }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0);
