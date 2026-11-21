"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type Banner = {
  image: string;
  imageAlt: string;
  /** object-position for the desktop crop, e.g. "50% 40%" */
  position?: string;
  /** object-position for the phone crop */
  mobilePosition?: string;
  eyebrow: string;
  title: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
  /** "light" = cream text on a darker photo, "dark" = cocoa text on a light photo */
  text?: "light" | "dark";
};

/**
 * Full-width photo banner slider, the way Pakistani kidswear stores open their homepage:
 * an edge-to-edge campaign photo, headline and a "Shop now" button, dots and side arrows.
 * Accessible: pause button, keyboard arrows, swipe, pauses on hover/focus/off-screen,
 * no autoplay for reduced motion.
 */
export function BannerSlider({ slides, interval = 5500, size = "home", label = "Featured collections" }: { slides: Banner[]; interval?: number; size?: "home" | "page"; label?: string }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const n = slides.length;
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setHidden(!e.isIntersecting || document.hidden), { threshold: 0.2 });
    const vis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", vis);
    if (root.current) io.observe(root.current);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  const autoplay = n > 1 && !reduced;
  const paused = userPaused || hover || hidden;
  useEffect(() => {
    if (!autoplay || paused) return;
    const t = window.setTimeout(() => go(index + 1), interval);
    return () => window.clearTimeout(t);
  }, [autoplay, paused, index, interval, go]);

  if (!n) return null;
  const darkUi = slides[index].text === "dark";

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className={cn("relative overflow-hidden bg-cream-200 lg:aspect-auto", size === "home" ? "aspect-[4/5] sm:aspect-[16/10] lg:h-[clamp(440px,calc(100svh-13rem),560px)]" : "aspect-[5/4] sm:aspect-[16/8] lg:h-[400px]")}
        style={{ touchAction: "pan-y" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHover(false)}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = start.current;
          start.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          const light = (s.text ?? "light") === "light";
          return (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.title.replace(/\*/g, "")}`}
              aria-hidden={!active}
              inert={!active}
              className={cn("absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none", active ? "z-10 opacity-100" : "pointer-events-none opacity-0")}
            >
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={cn("object-cover transition-transform duration-[6s] ease-out motion-reduce:transition-none [object-position:var(--pos-m)] lg:[object-position:var(--pos)]", active ? "scale-[1.04]" : "scale-100")}
                style={{ ["--pos" as string]: s.position ?? "50% 50%", ["--pos-m" as string]: s.mobilePosition ?? s.position ?? "50% 50%" }}
              />
              {/* shade for legible text */}
              <div
                aria-hidden
                className={cn(
                  "absolute inset-0",
                  light
                    ? "bg-gradient-to-t from-cocoa-900/70 via-cocoa-900/20 to-transparent lg:bg-gradient-to-r lg:from-cocoa-900/60 lg:via-cocoa-900/15"
                    : "bg-gradient-to-t from-cream-50 via-cream-50/80 to-transparent lg:bg-gradient-to-r lg:from-cream-50/90 lg:via-cream-50/40",
                )}
              />
              <div className="container-kt absolute inset-0 flex items-end pb-14 lg:items-center lg:pb-6">
                <div className={cn("max-w-xl transition-[opacity,transform] duration-700 motion-reduce:transition-none", active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0", light ? "text-cream-50 [&_.text-sage-700]:text-sun-200" : "text-cocoa")}>
                  <p className={cn("text-[0.72rem] font-semibold tracking-[0.2em] uppercase", light ? "text-cream-100/90" : "text-cocoa-500")}>{s.eyebrow}</p>
                  {i === 0 && size === "home" ? (
                    <h1 className="mt-3 font-display text-[clamp(2rem,0.9rem+3.8vw,4.6rem)] leading-[0.98] font-medium tracking-[-0.045em]">
                      <SplitWords text={s.title} />
                    </h1>
                  ) : (
                    <h2 className={cn("mt-3 font-display leading-[0.98] font-medium tracking-[-0.045em]", size === "home" ? "text-[clamp(2.4rem,1.1rem+3.6vw,4.6rem)]" : "text-[clamp(1.8rem,0.9rem+2.9vw,3.6rem)]")}>
                      <SplitWords text={s.title} />
                    </h2>
                  )}
                  {s.body && <p className={cn("mt-4 hidden max-w-md text-[1rem] leading-relaxed sm:block", light ? "text-cream-100/90" : "text-cocoa-600")}>{s.body}</p>}
                  <Link
                    href={s.ctaHref}
                    tabIndex={active ? undefined : -1}
                    className={cn(
                      "mt-6 inline-flex h-12 items-center rounded-full px-7 text-[0.8rem] font-semibold tracking-[0.14em] uppercase transition-colors lg:mt-8",
                      light ? "bg-cream-50 text-cocoa hover:bg-sun-200" : "bg-cocoa text-cream-50 hover:bg-sage-700",
                    )}
                  >
                    {s.ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {n > 1 && (
          <div className={cn("absolute inset-x-0 bottom-4 z-20", darkUi ? "text-cocoa" : "text-cream-50")}>
            <div className="container-kt flex items-center justify-center lg:justify-between">
              <span className="hidden w-[5.75rem] lg:block" />
              <div className={cn("flex items-center gap-1.5 rounded-full py-0.5 pr-0.5 pl-2 backdrop-blur-sm", darkUi ? "bg-cream-50/70" : "bg-cocoa-900/25")}>
                {slides.map((s, i) => (
                  <button key={i} type="button" onClick={() => go(i)} aria-label={`Show slide ${i + 1}: ${s.title.replace(/\*/g, "")}`} aria-current={i === index} className="grid h-6 place-items-center px-0.5">
                    <span className={cn("block h-2 rounded-full bg-current transition-all duration-500", i === index ? "w-7" : "w-2 opacity-50")} />
                  </button>
                ))}
                {autoplay && (
                  <button type="button" onClick={() => setUserPaused((v) => !v)} aria-label={userPaused ? "Play slideshow" : "Pause slideshow"} className={cn("ml-0.5 grid h-7 w-7 place-items-center rounded-full", darkUi ? "bg-cocoa/10" : "bg-cocoa-900/30")}>
                    {userPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </button>
                )}
              </div>
              <div className="hidden gap-2 lg:flex">
                <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid h-11 w-11 place-items-center rounded-full bg-cream-50/85 text-cocoa backdrop-blur transition-colors hover:bg-cream-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid h-11 w-11 place-items-center rounded-full bg-cream-50/85 text-cocoa backdrop-blur transition-colors hover:bg-cream-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
