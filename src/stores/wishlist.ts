"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  set: (ids: string[]) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) => {
        const on = !get().ids.includes(id);
        set({ ids: on ? [id, ...get().ids] : get().ids.filter((x) => x !== id) });
        return on;
      },
      set: (ids) => set({ ids: [...new Set(ids)] }),
    }),
    { name: "kt-wishlist", version: 1 },
  ),
);
