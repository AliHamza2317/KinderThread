"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A large statement that "reads itself" as you scroll: words go from faint to ink,
 * and small photographs open up inside the sentence. Use [[1]], [[2]]… for images.
 */
export function ScrubStatement({ text, images, eyebrow }: { text: string; images: string[]; eyebrow?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
      tl.fromTo(el.querySelectorAll("[data-w]"), { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: "none" }, 0);
      tl.fromTo(el.querySelectorAll("[data-pic]"), { width: 0 }, { width: "1.9em", stagger: 0.5, ease: "power2.out", duration: 0.6 }, 0.1);
    },
    { scope: ref },
  );

  const parts = text.split(/(\[\[\d+\]\])/g).filter(Boolean);
  const plain = text.replace(/\[\[\d+\]\]\s*/g, "");

  return (
    <div ref={ref} className="mx-auto max-w-[62rem] text-center">
      {eyebrow && <p className="eyebrow eyebrow-rule mb-8 justify-center">{eyebrow}</p>}
      <p className="sr-only">{plain}</p>
      <p aria-hidden className="font-display text-[clamp(1.9rem,1rem+3.2vw,4.1rem)] leading-[1.08] font-medium tracking-[-0.04em] text-cocoa">
        {parts.map((part, i) => {
          const m = part.match(/^\[\[(\d+)\]\]$/);
          if (m) {
            const src = images[Number(m[1]) - 1];
            if (!src) return null;
            return (
              <span key={i} data-pic className="relative mx-[0.12em] inline-block h-[0.82em] w-[1.9em] overflow-hidden rounded-full align-[-0.06em]">
                <Image src={src} alt="" fill sizes="140px" className="object-cover" />
              </span>
            );
          }
          return part
            .split(/(\s+)/)
            .map((w, j) => (/^\s+$/.test(w) ? w : w ? <span key={`${i}-${j}`} data-w className={/^\*.*\*[.,]?$/.test(w) ? "font-serif-accent text-sage-700" : undefined}>{w.replace(/\*/g, "")}</span> : null));
        })}
      </p>
    </div>
  );
}
