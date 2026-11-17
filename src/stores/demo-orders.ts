"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus } from "@/lib/types";

/**
 * Frontend-only build: orders placed at checkout are kept in this browser only
 * (so the confirmation and tracking pages can show them). Nothing is sent anywhere.
 */
export type DemoOrder = {
  number: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string | null;
  notes: string | null;
  paymentMethod: string;
  paymentReference: string | null;
  items: { name: string; size: string; color: string | null; image: string | null; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
};

type State = { orders: DemoOrder[]; add: (o: DemoOrder) => void };

export const useDemoOrders = create<State>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (o) => set({ orders: [o, ...get().orders].slice(0, 10) }),
    }),
    { name: "kt-demo-orders", version: 1 },
  ),
);

export function newOrderNumber() {
  const d = new Date();
  return `KT${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(10000 + Math.random() * 89999)}`;
}
