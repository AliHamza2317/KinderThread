"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  /** animate direct children one after another */
  stagger?: number;
  start?: string;
};

/** Scroll-triggered fade/rise. Content is visible without JS and with reduced motion. */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 36, stagger, start = "top 88%" }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = stagger ? Array.from(el.children) : [el];
      el.setAttribute("data-reveal-ready", "");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "expo.out",
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}

/** Split a heading into words that rise in sequence. */
export function SplitWords({ text, className, delay = 0, as: Tag = "span", italicWords = [] }: { text: string; className?: string; delay?: number; as?: ElementType; italicWords?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      el.setAttribute("data-reveal-ready", "");
      const words = el.querySelectorAll("[data-word]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(words, { yPercent: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        words,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.07, delay, scrollTrigger: { trigger: el, start: "top 90%", once: true } },
      );
    },
    { scope: ref },
  );
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} data-reveal="" aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top" aria-hidden>
          <span data-word className={`inline-block will-change-transform ${italicWords.includes(w.replace(/[.,!]/g, "")) ? "italic" : ""}`}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
