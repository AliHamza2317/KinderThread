"use client";
import { create } from "zustand";

export type Toast = { id: number; title: string; description?: string; tone?: "success" | "error" | "info"; action?: { label: string; href: string } };

type State = { toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void };

let n = 0;
export const useToasts = create<State>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++n;
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
    setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));

export const toast = (t: Omit<Toast, "id">) => useToasts.getState().push(t);
