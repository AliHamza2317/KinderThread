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

/** One slide's content: colour field, copy aligned to the page grid on the left, the subject (cut-out or full photo) filling the right. */
function SlideFace({ slide, active, size, heading, priority, controls = true, children }: { slide: Slide; active: boolean; size: "home" | "page"; heading: "h1" | "h2"; priority: boolean; controls?: boolean; children?: ReactNode }) {
  const t = TONES[slide.tone];
  const enter = cn("transition-[opacity,transform] duration-700 ease-[var(--ease-soft)] motion-reduce:transition-none", active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0");
  const Heading = heading;
  const cut = Boolean(slide.cutout);
  return (
    <div className={cn("relative isolate flex h-full flex-col overflow-hidden lg:block", t.bg, t.text)}>
      {/* subject: a cut-out on the colour field, or the full photo filling the right half */}
      <div className={cn("relative shrink-0 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto", cut ? "lg:w-[56%]" : "lg:w-1/2", size === "home" ? "h-[16rem] sm:h-[21rem]" : "h-[13rem] sm:h-[18rem]")}>
        {cut ? (
          <>
            {/* soft studio light behind the subject */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square h-[125%] -translate-x-1/2 -translate-y-1/2",
                t.dark ? "bg-[radial-gradient(closest-side,rgb(255_255_255/0.09),transparent)]" : "bg-[radial-gradient(closest-side,rgb(255_255_255/0.6),transparent)]",
              )}
            />
            <div
              className={cn(
                "absolute transition-[opacity,transform] duration-[1.1s] ease-[var(--ease-soft)] motion-reduce:transition-none",
                slide.align === "bottom" ? "inset-x-0 top-[5%] bottom-0" : slide.align === "right" ? "inset-y-[10%] right-0 left-[6%]" : "inset-x-[4%] inset-y-[6%]",
                active ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
              )}
            >
              <Image
                src={slide.cutout!}
                alt={slide.imageAlt}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={cn(
                  "object-contain",
                  slide.align === "bottom" ? "object-bottom" : slide.align === "right" ? "object-right" : "object-center drop-shadow-[0_28px_28px_rgb(20_16_12/0.24)]",
                )}
              />
            </div>
          </>
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
              "group absolute top-7 right-7 z-10 hidden items-center gap-3 rounded-full bg-cream-50/85 py-1.5 pr-1.5 pl-1.5 text-cocoa shadow-[0_18px_40px_-22px_rgb(20_16_12/0.45)] backdrop-blur-md transition-[opacity,transform] delay-300 duration-700 lg:flex xl:right-12",
              active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-cream-200">
              <Image src={slide.product.image} alt="" fill sizes="44px" className="object-cover" />
            </span>
            <span className="min-w-0 pr-1 leading-tight">
              <span className="block text-[0.84rem] font-semibold">{slide.product.name}</span>
              <span className="flex items-baseline gap-2 text-[0.76rem] text-cocoa-500">
                {formatPrice(slide.product.price)}
                {slide.product.isSample && <span className="text-[0.62rem] font-semibold tracking-[0.1em] text-cocoa-400 uppercase">Sample</span>}
              </span>
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>

      {/* copy, aligned with the header logo and the page grid */}
      <div className="container-kt pointer-events-none relative flex flex-1 items-center lg:h-full">
        <div className={cn("pointer-events-auto w-full max-w-[34rem] pt-5 lg:pt-0", controls ? "pb-[4.5rem] lg:pb-8" : "pb-9 lg:pb-0", t.accent)}>
          {children}
          <p className={cn("eyebrow eyebrow-rule", t.muted, enter)}>{slide.eyebrow}</p>
          <Heading className={cn("mt-3 font-display font-medium tracking-[-0.05em] delay-75", size === "home" ? "text-[clamp(2.5rem,1.2rem+3.4vw,4.9rem)]" : "text-[clamp(2.2rem,1.2rem+2.3vw,3.6rem)]", "leading-[0.98]", enter)}>
            {titleLines(slide.title).map((line, i) => (
              <SplitWords key={i} text={line} className="block" />
            ))}
          </Heading>
          {slide.body && <p className={cn("mt-4 hidden max-w-sm text-[0.98rem] leading-relaxed delay-150 sm:block", t.muted, enter)}>{slide.body}</p>}
          <div className={cn("mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 delay-200 lg:mt-8", enter)}>
            {slide.ctaLabel && slide.ctaHref && (
              <Link
                href={slide.ctaHref}
                tabIndex={active ? undefined : -1}
                className={cn(
                  "group inline-flex h-12 items-center gap-2 rounded-full pr-1.5 pl-5 text-[0.92rem] font-semibold transition-colors",
                  t.dark ? "bg-cream-50 text-cocoa hover:bg-sun-200" : "bg-cocoa text-cream-50 hover:bg-sage-700",
                )}
              >
                {slide.ctaLabel}
                <span className={cn("grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45", t.dark ? "bg-cocoa text-cream-50" : "bg-cream-50 text-cocoa")}>
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            )}
            {slide.secondaryLabel && slide.secondaryHref && (
              <Link href={slide.secondaryHref} tabIndex={active ? undefined : -1} className="group inline-flex items-center gap-2 text-[0.92rem] font-semibold">
                <span className="link-underline">{slide.secondaryLabel}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>
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
        className={cn("relative overflow-hidden", size === "home" ? "lg:h-[clamp(500px,calc(100svh-11rem),600px)]" : "lg:h-[420px]")}
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

        {/* controls, aligned with the copy */}
        {n > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
            <div className={cn("container-kt flex items-center gap-3 pb-5 lg:pb-7", dark ? "text-cream-50" : "text-cocoa")}>
              <div className="pointer-events-auto flex items-center gap-3">
                <span className="font-display text-[0.85rem] font-medium tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex w-24 gap-1.5 sm:w-32">
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
                <span className={cn("font-display text-[0.85rem] font-medium tabular-nums", dark ? "text-cream-50/55" : "text-cocoa-400")}>{String(n).padStart(2, "0")}</span>
                <div className="ml-2 flex gap-1">
                  {[
                    { label: "Previous slide", onClick: () => go(index - 1), icon: <ArrowLeft className="h-4 w-4" /> },
                    { label: "Next slide", onClick: () => go(index + 1), icon: <ArrowRight className="h-4 w-4" /> },
                    ...(autoplay ? [{ label: userPaused ? "Play slideshow" : "Pause slideshow", onClick: () => setUserPaused((v) => !v), icon: userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" /> }] : []),
                  ].map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={b.onClick}
                      aria-label={b.label}
                      className={cn("grid h-9 w-9 place-items-center rounded-full transition-colors", dark ? "hover:bg-cream-50/12" : "hover:bg-cocoa/8")}
                    >
                      {b.icon}
                    </button>
                  ))}
                </div>
              </div>
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
      <div className="relative overflow-hidden lg:h-[400px]">
        <SlideFace slide={slide} active size="page" heading="h1" priority controls={false}>
          {top}
        </SlideFace>
      </div>
    </section>
  );
}
