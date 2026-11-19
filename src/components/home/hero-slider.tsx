"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SplitWords } from "@/components/ui/reveal";
import { cn, formatPrice } from "@/lib/utils";

export type SlideTone = "sage" | "coral" | "sun" | "cream" | "cocoa" | "forest";

export type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image: string;
  imageAlt: string;
  /** transparent cut-out (subject without background) shown directly on the colour field */
  cutout?: string;
  /** how the cut-out sits: on the bottom edge (people), floating in the middle (garments) or against the right edge */
  align?: "bottom" | "center" | "right";
  tone: SlideTone;
  product?: { href: string; name: string; label: string; image: string; price: number; compareAt: number | null; isSample: boolean } | null;
};

const TONES: Record<SlideTone, { bg: string; shape: string; text: string; muted: string; accent: string; dark: boolean }> = {
  sage: { bg: "bg-sage-100", shape: "bg-sage-200/70", text: "text-cocoa", muted: "text-cocoa-500", accent: "[&_.text-sage-700]:text-sage-700", dark: false },
  coral: { bg: "bg-coral-100", shape: "bg-coral-200/60", text: "text-cocoa", muted: "text-cocoa-500", accent: "[&_.text-sage-700]:text-coral-700", dark: false },
  sun: { bg: "bg-sun-100", shape: "bg-sun-200/70", text: "text-cocoa", muted: "text-cocoa-500", accent: "[&_.text-sage-700]:text-sun-700", dark: false },
  cream: { bg: "bg-cream-200", shape: "bg-cream-300/60", text: "text-cocoa", muted: "text-cocoa-500", accent: "", dark: false },
  cocoa: { bg: "bg-cocoa", shape: "bg-cocoa-600/50", text: "text-cream-50", muted: "text-cream-200/80", accent: "[&_.text-sage-700]:text-sun-200", dark: true },
  forest: { bg: "bg-sage-700", shape: "bg-sage-600/60", text: "text-cream-50", muted: "text-cream-100/80", accent: "[&_.text-sage-700]:text-sun-200", dark: true },
};

export function toneOf(t: string): SlideTone {
  return (t in TONES ? t : "sage") as SlideTone;
}

/** "Little Moments. Big *Adventures.*" → two lines (after the first sentence). */
function titleLines(title: string) {
  const words = title.trim().split(/\s+/);
  const stop = words.findIndex((w) => /[.!?]\*?$/.test(w));
  return stop >= 0 && stop < words.length - 1 ? [words.slice(0, stop + 1).join(" "), words.slice(stop + 1).join(" ")] : [title];
}

/** One slide's content: colour field, copy on the left, the subject (cut-out or full photo) on the right. */
function SlideFace({ slide, active, size, heading, priority, controls = true, children }: { slide: Slide; active: boolean; size: "home" | "page"; heading: "h1" | "h2"; priority: boolean; controls?: boolean; children?: ReactNode }) {
  const t = TONES[slide.tone];
  const enter = cn("transition-[opacity,transform] duration-700 ease-[var(--ease-soft)] motion-reduce:transition-none", active ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0");
  const Heading = heading;
  return (
    <div className={cn("relative isolate grid h-full overflow-hidden lg:grid-cols-2", t.bg, t.text)}>
      {/* soft shape behind the subject (like the circles on brand banners) */}
      <div aria-hidden className={cn("pointer-events-none absolute -z-10 aspect-square rounded-full", t.shape, size === "home" ? "top-[8%] right-[2%] h-[95%] max-lg:top-[2%] max-lg:right-[-25%] max-lg:h-[55%]" : "top-[6%] right-[4%] h-[100%] max-lg:h-[60%] max-lg:right-[-20%]")} />

      {/* photograph: a cut-out on the colour field, or the full photo filling the right half */}
      <div className={cn("relative order-1 lg:order-2", size === "home" ? "h-[17rem] sm:h-[22rem] lg:h-full" : "h-[15rem] sm:h-[20rem] lg:h-full")}>
        {slide.cutout ? (
          <div
            className={cn(
              "absolute transition-[opacity,transform] duration-[1.1s] ease-[var(--ease-soft)] motion-reduce:transition-none",
              slide.align === "bottom" ? "inset-x-4 top-4 bottom-0 lg:inset-x-10 lg:top-[7%]" : slide.align === "right" ? "inset-y-[10%] right-0 left-4 lg:left-10" : "inset-[8%] lg:inset-[9%]",
              active ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0",
            )}
          >
            <Image
              src={slide.cutout}
              alt={slide.imageAlt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={cn(
                "object-contain",
                slide.align === "bottom" ? "object-bottom" : slide.align === "right" ? "object-right" : "object-center drop-shadow-[0_34px_34px_rgb(20_16_12/0.28)]",
              )}
            />
          </div>
        ) : (
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn("object-cover transition-transform duration-[1.8s] ease-[var(--ease-soft)] motion-reduce:transition-none", active ? "scale-100" : "scale-105")}
          />
        )}
        {slide.product && (
          <Link
            href={slide.product.href}
            tabIndex={active ? undefined : -1}
            className={cn(
              "group absolute top-8 right-8 z-10 hidden w-[19rem] items-center gap-3 rounded-[1.25rem] border border-white/50 bg-cream-50/90 p-2.5 pr-3 text-cocoa shadow-[0_24px_50px_-24px_rgb(20_16_12/0.5)] backdrop-blur-md transition-[opacity,transform] delay-300 duration-700 lg:flex xl:right-14",
              active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[0.8rem] bg-cream-200">
              <Image src={slide.product.image} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[0.64rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">
                {slide.product.label}
                {slide.product.isSample && <span className="rounded-full border border-cocoa/10 px-1.5 text-[0.56rem]">Sample</span>}
              </span>
              <span className="block truncate text-[0.9rem] font-semibold">{slide.product.name}</span>
              <span className="flex items-baseline gap-2 text-[0.8rem]">
                <span className="font-semibold">{formatPrice(slide.product.price)}</span>
                {slide.product.compareAt && slide.product.compareAt > slide.product.price && <span className="text-cocoa-400 line-through">{formatPrice(slide.product.compareAt)}</span>}
              </span>
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>

      {/* copy */}
      <div className={cn("relative order-2 flex flex-col justify-center px-6 pt-5 lg:order-1 lg:px-14 lg:pt-0 xl:px-20", controls ? "pb-20 lg:pb-24" : "pb-10 lg:pb-0", t.accent)}>
        {children}
        <p className={cn("eyebrow eyebrow-rule", t.muted, enter)}>{slide.eyebrow}</p>
        <Heading className={cn("mt-4 font-display font-medium tracking-[-0.055em] delay-75", size === "home" ? "text-[clamp(2.6rem,0.8rem+5vw,6.4rem)]" : "text-[clamp(2.4rem,1rem+3.2vw,4.6rem)]", "leading-[0.95]", enter)}>
          {titleLines(slide.title).map((line, i) => (
            <SplitWords key={i} text={line} className="block" />
          ))}
        </Heading>
        {slide.body && <p className={cn("mt-5 max-w-md text-[0.98rem] leading-relaxed delay-150 md:text-[1.06rem] [@media(max-height:760px)_and_(max-width:639px)]:hidden", t.muted, enter)}>{slide.body}</p>}
        <div className={cn("mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 delay-200 lg:mt-7", enter)}>
          {slide.ctaLabel && slide.ctaHref && (
            <Link
              href={slide.ctaHref}
              tabIndex={active ? undefined : -1}
              className={cn(
                "group inline-flex h-14 items-center gap-2 rounded-full pr-2 pl-6 text-[0.95rem] font-semibold transition-colors",
                t.dark ? "bg-sun-300 text-cocoa hover:bg-sun-200" : "bg-cocoa text-cream-50 hover:bg-sage-700",
              )}
            >
              {slide.ctaLabel}
              <span className={cn("grid h-10 w-10 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45", t.dark ? "bg-cocoa text-cream-50" : "bg-cream-50 text-cocoa")}>
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          )}
          {slide.secondaryLabel && slide.secondaryHref && (
            <Link href={slide.secondaryHref} tabIndex={active ? undefined : -1} className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold">
              <span className="link-underline">{slide.secondaryLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Full-width hero slider, as on brand homepages: a colour field per slide, headline +
 * button on the left, the subject (cut-out on the colour, or the full photo) on the right.
 * Accessible carousel: arrows, progress, pause; swipe on touch; pauses on hover/focus,
 * in background tabs and off-screen; no autoplay for reduced motion.
 */
export function HeroSlider({ slides, size = "home", interval = 6500, label = "Featured collections", top }: { slides: Slide[]; size?: "home" | "page"; interval?: number; label?: string; top?: ReactNode }) {
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
    const vis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", vis);
    const io = new IntersectionObserver(([e]) => setHidden(!e.isIntersecting || document.hidden), { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      io.disconnect();
    };
  }, []);

  if (!n) return null;
  const autoplay = n > 1 && !reduced;
  const paused = userPaused || hover || hidden;
  const dark = TONES[slides[index].tone].dark;

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className={cn("relative overflow-hidden", size === "home" ? "lg:h-[min(calc(100svh-8.5rem),780px)] lg:min-h-[580px]" : "lg:h-[min(62svh,560px)] lg:min-h-[440px]")}
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
        <div className="grid h-full">
          {slides.map((s, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.title.replace(/\*/g, "")}`}
              aria-hidden={i !== index}
              inert={i !== index}
              className={cn("[grid-area:1/1] transition-opacity duration-700 motion-reduce:transition-none", i === index ? "z-10 opacity-100" : "pointer-events-none opacity-0")}
            >
              <SlideFace slide={s} active={i === index} size={size} heading={size === "home" && i === 0 ? "h1" : "h2"} priority={i === 0} controls={n > 1}>
                {i === 0 && top}
              </SlideFace>
            </div>
          ))}
        </div>

        {/* controls */}
        {n > 1 && (
          <div className={cn("absolute bottom-5 left-6 z-20 flex items-center gap-3 lg:bottom-8 lg:left-14 xl:left-20", dark ? "text-cream-50" : "text-cocoa")}>
            <span className="font-display text-[0.9rem] font-medium tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <div className="flex w-28 gap-1.5 sm:w-40">
              {slides.map((s, i) => (
                <button key={i} type="button" onClick={() => go(i)} className="relative h-6 flex-1" aria-label={`Show slide ${i + 1}: ${s.title.replace(/\*/g, "")}`} aria-current={i === index}>
                  <span className={cn("absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full", dark ? "bg-cream-50/25" : "bg-cocoa/15")}>
                    {i < index && <span className="absolute inset-0 bg-current" />}
                    {i === index &&
                      (autoplay ? (
                        <span
                          key={`${index}`}
                          className="absolute inset-0 origin-left bg-current"
                          style={{ animation: `kt-progress ${interval}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                          onAnimationEnd={() => go(index + 1)}
                        />
                      ) : (
                        <span className="absolute inset-0 bg-current" />
                      ))}
                  </span>
                </button>
              ))}
            </div>
            <span className={cn("font-display text-[0.9rem] font-medium tabular-nums", dark ? "text-cream-50/60" : "text-cocoa-400")}>{String(n).padStart(2, "0")}</span>
            <div className="ml-1 flex gap-1.5">
              <button type="button" onClick={() => go(index - 1)} className={cn("grid h-10 w-10 place-items-center rounded-full border transition-colors", dark ? "border-cream-50/25 hover:bg-cream-50 hover:text-cocoa" : "border-cocoa/15 hover:bg-cocoa hover:text-cream-50")} aria-label="Previous slide">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(index + 1)} className={cn("grid h-10 w-10 place-items-center rounded-full border transition-colors", dark ? "border-cream-50/25 hover:bg-cream-50 hover:text-cocoa" : "border-cocoa/15 hover:bg-cocoa hover:text-cream-50")} aria-label="Next slide">
                <ArrowRight className="h-4 w-4" />
              </button>
              {autoplay && (
                <button type="button" onClick={() => setUserPaused((v) => !v)} className={cn("grid h-10 w-10 place-items-center rounded-full border transition-colors", dark ? "border-cream-50/25 hover:bg-cream-50 hover:text-cocoa" : "border-cocoa/15 hover:bg-cocoa hover:text-cream-50")} aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}>
                  {userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** A single slide used as a collection banner (same look, no controls). */
export function SlideBanner({ slide, top }: { slide: Slide; top?: ReactNode }) {
  return (
    <section>
      <div className="relative overflow-hidden lg:h-[min(56svh,500px)] lg:min-h-[420px]">
        <SlideFace slide={slide} active size="page" heading="h1" priority controls={false}>
          {top}
        </SlideFace>
      </div>
    </section>
  );
}
