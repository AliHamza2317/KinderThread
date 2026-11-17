"use client";
import { create } from "zustand";
import type { ProductCardData } from "@/lib/catalog";

type UiState = {
  searchOpen: boolean;
  menuOpen: boolean;
  quickAdd: ProductCardData | null;
  setSearch: (v: boolean) => void;
  setMenu: (v: boolean) => void;
  openQuickAdd: (p: ProductCardData | null) => void;
};

export const useUi = create<UiState>((set) => ({
  searchOpen: false,
  menuOpen: false,
  quickAdd: null,
  setSearch: (searchOpen) => set({ searchOpen }),
  setMenu: (menuOpen) => set({ menuOpen }),
  openQuickAdd: (quickAdd) => set({ quickAdd }),
}));
