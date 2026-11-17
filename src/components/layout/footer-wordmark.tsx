"use client";

import { motion } from "motion/react";

/** Oversized brand name that rises letter by letter when the footer comes into view. */
export function FooterWordmark({ text }: { text: string }) {
  const letters = Array.from(text);
  return (
    <div className="container-kt select-none" aria-hidden>
      <motion.p
        className="flex justify-between overflow-hidden pb-[0.04em] font-display text-[clamp(3.5rem,-0.5rem+15.5vw,15rem)] leading-[0.85] font-semibold tracking-[-0.06em] whitespace-nowrap text-cream-50"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        transition={{ staggerChildren: 0.035 }}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </motion.p>
    </div>
  );
}
