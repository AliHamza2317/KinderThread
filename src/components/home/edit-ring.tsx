"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { RingControl, RingItem } from "@/components/three/ring-carousel";
import { useDeviceTier, useInView } from "@/lib/hooks";

const RingCarousel = dynamic(() => import("@/components/three/ring-carousel"), { ssr: false });

/** "The Edit" — collections on a 3D ring (drag / arrows / autoplay), with a swipe-row fallback. */
export function EditRing({ items, eyebrow, title, accent }: { items: (RingItem & { description?: string | null })[]; eyebrow: string; title: string; accent?: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tier = useDeviceTier();
  const inView = useInView(root, "100px");
  const router = useRouter();
  const ring = useRef<RingControl>({ target: 0, current: 0, dragging: false });
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const hovering = useRef(false);
  const step = (Math.PI * 2) / items.length;
  const n = items.length;

  const go = (dir: number) => {
    ring.current.target = Math.round(ring.current.target / step) * step + dir * step;
  };

  // keep the caption in sync with the photo at the front
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const loop = () => {
      const i = ((Math.round(ring.current.current / step) % n) + n) % n;
      setIndex((prev) => (prev === i ? prev : i));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, step, n]);

  // gentle autoplay while visible and untouched
  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (!ring.current.dragging && !hovering.current) go(1);
    }, 3800);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, step]);

  const show3d = tier === "full" || tier === "lite";
  const current = items[index];

  return (
    <section ref={root} className="relative overflow-hidden rounded-[2rem] bg-cocoa-900 py-20 text-cream-50 md:rounded-[3rem] md:py-28" aria-roledescription="carousel" aria-label={title}>
      <div className="container-kt relative z-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow eyebrow-rule text-cream-200">{eyebrow}</p>
          <h2 className="display-lg mt-5">
            {title} {accent && <span className="font-serif-accent text-coral-300">{accent}</span>}
          </h2>
        </div>
        <p className="max-w-xs text-[0.95rem] leading-relaxed text-cream-200/80">Drag to turn the ring, then tap a photo to open the collection.</p>
      </div>

      {show3d ? (
        <div
          ref={stage}
          className="relative mt-4 h-[56vh] min-h-[380px] cursor-grab touch-pan-y select-none active:cursor-grabbing md:h-[64vh]"
          data-cursor="Drag"
          onPointerEnter={() => (hovering.current = true)}
          onPointerLeave={() => {
            hovering.current = false;
            if (drag.current) end();
          }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, moved: 0 };
            ring.current.dragging = true;
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const dx = e.clientX - drag.current.x;
            drag.current.x = e.clientX;
            drag.current.moved += Math.abs(dx);
            ring.current.target -= dx * 0.0042;
          }}
          onPointerUp={() => end()}
          onPointerCancel={() => end()}
        >
          <RingCarousel
            items={items}
            active={inView}
            ring={ring}
            onSelect={(i) => {
              const front = ((Math.round(ring.current.current / step) % n) + n) % n;
              if (i === front) router.push(items[i].href);
              else ring.current.target = ring.current.current + (((i - front + n + n / 2) % n) - n / 2) * step;
            }}
          />
        </div>
      ) : (
        <div className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:px-8 xl:px-12">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="group w-[62vw] shrink-0 snap-start sm:w-[36vw] lg:w-[22vw]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
                <Image src={it.src} alt="" fill sizes="(min-width:1024px) 22vw, 62vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="mt-3 font-display text-xl tracking-[-0.03em]">{it.label}</p>
            </Link>
          ))}
        </div>
      )}

      {show3d && current && (
        <div className="container-kt relative z-10 mt-2 flex flex-wrap items-end justify-between gap-6">
          <div className="min-h-[6.5rem]" aria-live="polite">
            <p className="text-[0.75rem] tabular-nums tracking-[0.2em] text-cream-200/70">
              {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
            <AnimatePresence mode="wait">
              <motion.div key={index} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <Link href={current.href} className="group mt-2 inline-flex items-center gap-3 font-display text-[clamp(1.8rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.04em]">
                  {current.label}
                  <ArrowUpRight className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45" />
                </Link>
                {current.description && <p className="mt-2 max-w-md text-[0.9rem] text-cream-200/75">{current.description}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-cream-50/20 transition-colors hover:bg-cream-50 hover:text-cocoa" aria-label="Previous collection">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full border border-cream-50/20 transition-colors hover:bg-cream-50 hover:text-cocoa" aria-label="Next collection">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );

  function end() {
    if (!drag.current) return;
    drag.current = null;
    ring.current.dragging = false;
    ring.current.target = Math.round(ring.current.target / step) * step;
  }
}
