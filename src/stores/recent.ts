"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentState = { ids: string[]; push: (id: string) => void };

export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) => set({ ids: [id, ...get().ids.filter((x) => x !== id)].slice(0, 12) }),
    }),
    { name: "kt-recent", version: 1 },
  ),
);
