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

export type DeviceTier = "full" | "lite" | "static";

/** Decide how much 3D a device should get. */
export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "static";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return "static";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "static";
  } catch {
    return "static";
  }
  if ((nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2) return "static";
  const small = window.matchMedia("(max-width: 767px)").matches;
  if (small || (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4) return "lite";
  return "full";
}
