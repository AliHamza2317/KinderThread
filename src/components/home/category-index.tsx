"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/reveal";

type Cat = { id: string; name: string; slug: string; image: string | null; description: string | null; count: number };

/**
 * Editorial index of categories. On desktop the photograph of the hovered row
 * floats next to the cursor; on phones each row shows its own thumbnail.
 */
export function CategoryIndex({ categories }: { categories: Cat[] }) {
  const [active, setActive] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const rot = useSpring(0, { stiffness: 120, damping: 14 });
  const lastX = useRef(0);

  return (
    <div
      ref={box}
      className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !box.current) return;
        const r = box.current.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
        rot.set(Math.max(-8, Math.min(8, (e.clientX - lastX.current) * 0.6)));
        lastX.current = e.clientX;
      }}
      onPointerLeave={() => setActive(null)}
    >
      <Reveal as="ul" stagger={0.06} className="border-t border-cocoa/10">
        {categories.map((c, i) => (
          <li key={c.id} onPointerEnter={() => setActive(i)}>
            <Link
              href={`/collections/${c.slug}`}
              data-cursor="Shop"
              className="group relative flex items-center gap-4 border-b border-cocoa/10 py-5 transition-colors md:gap-8 md:py-7"
            >
              <span className="hidden w-10 text-[0.75rem] font-medium tabular-nums text-cocoa-400 md:block">{String(i + 1).padStart(2, "0")}</span>
              {c.image && (
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl md:hidden">
                  <Image src={c.image} alt="" fill sizes="60px" className="object-cover" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[clamp(1.7rem,1rem+3.4vw,4.6rem)] leading-[1] font-medium tracking-[-0.045em] transition-[transform,color] duration-500 ease-[var(--ease-soft)] md:group-hover:translate-x-4 md:group-hover:text-sage-700">
                  {c.name}
                </span>
                {c.description && <span className="mt-1.5 block truncate text-[0.85rem] text-cocoa-500 md:hidden">{c.description}</span>}
              </span>
              <span className="hidden max-w-[16rem] text-right text-[0.85rem] leading-snug text-cocoa-500 lg:block">{c.description}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="hidden rounded-full border border-cocoa/10 px-3 py-1 text-[0.75rem] tabular-nums text-cocoa-500 sm:inline">
                  {c.count} {c.count === 1 ? "piece" : "pieces"}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/15 transition-colors duration-300 group-hover:border-cocoa group-hover:bg-cocoa group-hover:text-cream-50">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </Reveal>

      {/* floating preview (desktop pointer only) */}
      <motion.div className="pointer-events-none absolute top-0 left-0 z-10 hidden md:block" style={{ x: sx, y: sy, rotate: rot }} aria-hidden>
        <AnimatePresence>
          {active !== null && categories[active]?.image && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative -mt-[9.5rem] ml-10 h-[19rem] w-[15rem] overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-25px_rgb(20_16_12/0.45)]"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={categories[active].image!} alt="" fill sizes="240px" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
