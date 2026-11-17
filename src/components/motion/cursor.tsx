"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Custom cursor for fine pointers: a small ink dot that grows over interactive
 * elements and shows a label for elements with data-cursor="View" etc.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.35 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");
    let last = { x: -100, y: -100 };
    const inspect = (target: Element | null) => {
      const el = target?.closest<HTMLElement>("[data-cursor], a, button, [role=button], [role=link], label, select, summary");
      setLabel(el?.dataset.cursor ?? null);
      setActive(!!el);
    };
    const move = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      x.set(e.clientX);
      y.set(e.clientY);
      inspect(e.target as Element | null);
    };
    // content moves under a still pointer while scrolling — keep the label honest
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => inspect(document.elementFromPoint(last.x, last.y)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const press = () => setDown(true);
    const release = () => setDown(false);
    const leave = () => x.set(-100);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = label ? 84 : active ? 44 : 10;
  return (
    <motion.div className={`pointer-events-none fixed top-0 left-0 z-[200] ${label ? "" : "mix-blend-difference"}`} style={{ x: sx, y: sy }} aria-hidden>
      <motion.div
        className={`flex items-center justify-center rounded-full text-[0.72rem] font-semibold tracking-wide ${label ? "bg-cocoa text-cream-50 shadow-[0_12px_30px_-12px_rgb(20_16_12/0.6)]" : "bg-white text-black"}`}
        animate={{ width: size, height: size, x: -size / 2, y: -size / 2, scale: down ? 0.85 : 1, opacity: active && !label ? 0.9 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <AnimatePresence>
          {label && (
            <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
