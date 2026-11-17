"use client";

import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Piece = { text: string; image?: string };

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Big type that drifts sideways and speeds up / reverses with scroll velocity. */
export function VelocityMarquee({ pieces, baseVelocity = -2.2, className }: { pieces: Piece[]; baseVelocity?: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const dir = useRef(1);
  const tx = useTransform(x, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    x.set(x.get() + move);
  });

  const row = (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="flex shrink-0 items-center gap-[0.35em] pr-[0.35em]">
          <span>{p.text}</span>
          {p.image ? (
            <span className="relative inline-block h-[0.78em] w-[1.3em] shrink-0 overflow-hidden rounded-full">
              <Image src={p.image} alt="" fill sizes="160px" className="object-cover" />
            </span>
          ) : (
            <span className="inline-block h-[0.22em] w-[0.22em] shrink-0 rounded-full bg-coral" />
          )}
        </span>
      ))}
    </>
  );

  return (
    <div className={className}>
      <p className="sr-only">{pieces.map((p) => p.text).join(" · ")}</p>
      <div className="flex overflow-hidden whitespace-nowrap" aria-hidden>
        <motion.div className="flex shrink-0 font-display text-[clamp(3.4rem,1.6rem+7vw,9rem)] leading-[1.05] font-medium tracking-[-0.05em]" style={{ x: tx }}>
          {row}
          {row}
          {row}
          {row}
        </motion.div>
      </div>
    </div>
  );
}
