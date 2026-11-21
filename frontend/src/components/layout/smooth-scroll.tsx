"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/**
 * Light smooth scrolling for mouse/trackpad users on desktop only.
 * Phones, touch screens and reduced-motion users keep native scrolling,
 * and the library is only downloaded when it will actually be used.
 */
export function SmoothScroll({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches) return;
    let raf = 0;
    let cancelled = false;
    let onLock: ((e: Event) => void) | null = null;
    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      const lenis = new LenisCtor({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.95 });
      lenisInstance = lenis;
      const tick = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      onLock = (e: Event) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start());
      window.addEventListener("kt:scroll-lock", onLock);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (onLock) window.removeEventListener("kt:scroll-lock", onLock);
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, [enabled]);

  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
