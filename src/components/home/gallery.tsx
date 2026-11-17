"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type G = { id: string; url: string; alt: string; href: string | null };

/** Columns of photographs drifting at different speeds as you scroll. */
export function Gallery({ images, instagram }: { images: G[]; instagram: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const speeds = [-10, 8, -16, 12];
      gsap.utils.toArray<HTMLElement>("[data-col]").forEach((col, i) => {
        gsap.fromTo(col, { yPercent: -speeds[i % speeds.length] / 2 }, { yPercent: speeds[i % speeds.length] / 2, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: root },
  );
  if (!images.length) return null;
  const cols: G[][] = [[], [], [], []];
  images.slice(0, 8).forEach((g, i) => cols[i % 4].push(g));

  return (
    <div ref={root} className="grid grid-cols-2 gap-3 py-8 md:grid-cols-4 md:gap-4">
      {cols.map((col, ci) => (
        <div key={ci} data-col className={ci % 2 ? "mt-10 flex flex-col gap-3 md:mt-20 md:gap-4" : "flex flex-col gap-3 md:gap-4"}>
          {col.map((g, gi) => {
            const href = g.href || instagram;
            const tile = (
              <div className={`group relative overflow-hidden rounded-[1.25rem] bg-cream-200 md:rounded-[1.5rem] ${(ci + gi) % 2 ? "aspect-[4/5]" : "aspect-square"}`}>
                <Image src={g.url} alt={g.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105" />
              </div>
            );
            return href ? (
              <a key={g.id} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${g.alt} — open Instagram`} data-cursor="Open">
                {tile}
              </a>
            ) : (
              <div key={g.id}>{tile}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
