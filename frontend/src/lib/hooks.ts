"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

let lockCount = 0;
export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount++;
    const html = document.documentElement;
    const sbw = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (sbw > 0) html.style.paddingRight = `${sbw}px`;
    window.dispatchEvent(new CustomEvent("kt:scroll-lock", { detail: true }));
    return () => {
      lockCount--;
      if (lockCount === 0) {
        html.style.overflow = "";
        html.style.paddingRight = "";
        window.dispatchEvent(new CustomEvent("kt:scroll-lock", { detail: false }));
      }
    };
  }, [locked]);
}

export function useMediaQuery(query: string, initial = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => initial,
  );
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** true after hydration — use to avoid SSR mismatches for persisted client state */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
