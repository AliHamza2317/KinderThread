"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { GalleryItem } from "@/components/three/floating-gallery";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonClass } from "@/components/ui/button";
import { useDeviceTier, useInView } from "@/lib/hooks";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FloatingGallery = dynamic(() => import("@/components/three/floating-gallery"), { ssr: false });

type HeroContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

/** Waits for the first-visit preloader (if any) before running the intro. */
function useIntroGate() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!document.documentElement.classList.contains("kt-intro")) {
      setGo(true);
      return;
    }
    const done = () => setGo(true);
    window.addEventListener("kt:intro-done", done, { once: true });
    const safety = setTimeout(done, 4500);
    return () => {
      window.removeEventListener("kt:intro-done", done);
      clearTimeout(safety);
    };
  }, []);
  return go;
}

export function Hero({ content, trust, items }: { content: HeroContent; trust: string[]; items: GalleryItem[] }) {
  const root = useRef<HTMLElement>(null);
  const scroll = useRef(0);
  const tier = useDeviceTier();
  const inView = useInView(root, "0px");
  const play = useIntroGate();
  const [label, setLabel] = useState<string | null>(null);

  // split "Little Moments. Big Adventures." into two lines; the last word gets the serif accent
  const words = content.heading.trim().split(/\s+/);
  const stop = words.findIndex((w) => /[.!?]$/.test(w));
  const lines = stop >= 0 && stop < words.length - 1 ? [words.slice(0, stop + 1), words.slice(stop + 1)] : [words];

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      el.querySelectorAll("[data-reveal]").forEach((n) => n.setAttribute("data-reveal-ready", ""));
      // camera glide + copy drift as the hero scrolls away
      ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top", onUpdate: (s) => (scroll.current = s.progress) });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to("[data-hero-copy]", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "75% top", scrub: true } });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!play || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-hero-word]", { yPercent: 115, rotate: 4, duration: 1.5, stagger: 0.08 }, 0.1)
        .from("[data-hero-fade]", { y: 20, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.5)
        .from("[data-hero-bar] > *", { y: 12, opacity: 0, duration: 1, stagger: 0.08 }, 0.9);
    },
    { scope: root, dependencies: [play] },
  );

  const show3d = tier === "full" || tier === "lite";

  return (
    <section
      ref={root}
      className="relative isolate -mt-[72px] h-[calc(100svh-2.25rem)] min-h-[620px] overflow-hidden bg-cream lg:-mt-[84px] lg:min-h-[700px]"
      aria-label="Introduction"
    >
      {/* soft light behind the scene */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_45%,var(--color-cream-50)_0%,transparent_70%)]" aria-hidden />

      {/* 3D photo field (or a still collage when WebGL is off / reduced motion) */}
      <div className="absolute inset-0" data-cursor={label ? "View" : undefined}>
        {show3d && <FloatingGallery items={items} active={inView} play={play} onHover={setLabel} scroll={scroll} lite={tier === "lite"} />}
        {tier === "static" && <StillCollage items={items} />}
      </div>

      {/* copy */}
      <div data-hero-copy className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-end px-5 pb-10 text-center md:justify-center md:pt-16 md:pb-0">
        <p data-hero-fade data-reveal className="eyebrow eyebrow-rule rounded-full bg-cream-50/70 px-3.5 py-1.5 text-cocoa-600 backdrop-blur-md">
          {content.eyebrow}
        </p>
        <h1 className="display-xl mt-6 text-cocoa" aria-label={content.heading}>
          {lines.map((line, li) => (
            <span key={li} className="block" aria-hidden>
              {line.map((w, i) => {
                const accent = li === lines.length - 1 && i === line.length - 1 && lines.length > 1;
                return (
                  <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-top">
                    <span data-hero-word className={cn("inline-block", accent && "font-serif-accent pr-[0.04em] text-sage-700")}>
                      {w}
                    </span>
                    {i < line.length - 1 && <span className="inline-block w-[0.22em]" />}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
        <p data-hero-fade data-reveal className="mt-5 max-w-[34rem] text-[0.95rem] leading-relaxed text-cocoa-500 md:mt-6 md:text-[1.06rem] [@media(max-height:700px)_and_(max-width:767px)]:hidden">
          {content.subheading}
        </p>
        <div data-hero-fade data-reveal className="pointer-events-auto mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-8">
          <Magnetic>
            <Link href={content.primary.href} className={buttonClass("primary", "lg", "group pr-2.5")}>
              {content.primary.label}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-50 text-cocoa transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href={content.secondary.href} className={buttonClass("light", "lg", "bg-cream-50/70 backdrop-blur-md")}>
              {content.secondary.label}
            </Link>
          </Magnetic>
        </div>
      </div>

      {/* bottom bar */}
      <div data-hero-bar className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden items-end justify-between px-8 pb-7 text-[0.72rem] font-medium text-cocoa-500 md:flex xl:px-12">
        <div className="min-w-[12rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={label ?? "hint"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", label ? "bg-coral" : "bg-cocoa-300")} />
              {label ? <span className="text-cocoa">Shop {label}</span> : show3d ? "Move your cursor · tap a photo to explore" : "Sample photography"}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="tracking-[0.2em] uppercase">Scroll</span>
          <span className="grid h-9 w-6 justify-center rounded-full border border-cocoa/20 pt-1.5">
            <motion.span className="block h-1.5 w-1 rounded-full bg-cocoa" animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </div>
        <ul className="flex min-w-[12rem] justify-end gap-5">
          {trust.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

    </section>
  );
}

/** Still fallback: the same photographs, placed around the headline. */
function StillCollage({ items }: { items: GalleryItem[] }) {
  const spots = [
    "left-[4%] top-[16%] w-[17vw] max-md:left-[4%] max-md:top-[12%] max-md:w-[30vw]",
    "left-[12%] bottom-[8%] w-[14vw] max-md:left-[35%] max-md:top-[24%] max-md:bottom-auto max-md:w-[28vw]",
    "right-[5%] top-[14%] w-[16vw] max-md:right-[4%] max-md:top-[10%] max-md:w-[30vw]",
    "right-[13%] bottom-[7%] w-[13vw] max-md:hidden",
    "left-[30%] top-[6%] w-[9vw] max-md:hidden",
    "right-[30%] bottom-[4%] w-[9vw] max-md:hidden",
  ];
  return (
    <div className="absolute inset-0" aria-hidden>
      {spots.map((cls, i) => {
        const it = items[i % items.length];
        return (
          <Link key={i} href={it.href} tabIndex={-1} className={cn("absolute aspect-[4/5] overflow-hidden rounded-[1.25rem] opacity-90 shadow-soft transition-transform duration-700 hover:scale-[1.03]", cls)}>
            <Image src={it.src} alt="" fill sizes="20vw" className="object-cover" />
          </Link>
        );
      })}
    </div>
  );
}
