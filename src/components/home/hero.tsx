"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { SlideshowPointer } from "@/components/three/liquid-slideshow";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonClass } from "@/components/ui/button";
import { useDeviceTier, useInView } from "@/lib/hooks";
import { cn, formatPrice } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LiquidSlideshow = dynamic(
  () => import("@/components/three/liquid-slideshow"),
  { ssr: false },
);

const DURATION = 6.5; // seconds per slide

export type HeroSlide = {
  image: string;
  href: string;
  name: string;
  label: string;
  price: number;
  compareAt: number | null;
  isSample: boolean;
};

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

export function Hero({
  content,
  slides,
  badge,
}: {
  content: HeroContent;
  slides: HeroSlide[];
  badge: string;
}) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<SlideshowPointer>({ inside: false });
  const elapsed = useRef(0);
  const router = useRouter();
  const tier = useDeviceTier();
  const inView = useInView(root, "0px");
  const play = useIntroGate();
  const [index, setIndex] = useState(0);
  const [glReady, setGlReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const n = slides.length;
  const slide = slides[index];

  useEffect(
    () =>
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    [],
  );

  const go = useCallback(
    (i: number) => {
      elapsed.current = 0;
      setIndex(((i % n) + n) % n);
    },
    [n],
  );

  // autoplay with a pausable clock (pauses on hover, off-screen and in background tabs)
  useEffect(() => {
    if (!play || reduced || n < 2) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (inView && !pointer.current.inside && !document.hidden)
        elapsed.current += dt;
      root.current
        ?.querySelectorAll<HTMLElement>(`[data-bar="${index}"]`)
        .forEach(
          (b) =>
            (b.style.transform = `scaleX(${Math.min(1, elapsed.current / DURATION)})`),
        );
      if (elapsed.current >= DURATION) go(index + 1);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduced, inView, index, n, go]);

  // split "Little Moments. Big Adventures." into two lines; the last word gets the serif accent
  const words = content.heading.trim().split(/\s+/);
  const stop = words.findIndex((w) => /[.!?]$/.test(w));
  const lines =
    stop >= 0 && stop < words.length - 1
      ? [words.slice(0, stop + 1), words.slice(stop + 1)]
      : [words];

  useGSAP(
    () => {
      root.current
        ?.querySelectorAll("[data-reveal]")
        .forEach((el) => el.setAttribute("data-reveal-ready", ""));
      if (
        !play ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        "[data-hero-stage]",
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.6,
          ease: "expo.inOut",
          clearProps: "clipPath",
        },
        0,
      )
        .from(
          "[data-hero-stage-inner]",
          { scale: 1.25, duration: 2.2, ease: "expo.out" },
          0.2,
        )
        .from(
          "[data-hero-word]",
          { yPercent: 115, rotate: 3, duration: 1.4, stagger: 0.07 },
          0.25,
        )
        .from(
          "[data-hero-fade]",
          { y: 18, opacity: 0, duration: 1.1, stagger: 0.08 },
          0.6,
        )
        .from(
          "[data-hero-pop]",
          {
            scale: 0.6,
            opacity: 0,
            duration: 1,
            stagger: 0.12,
            ease: "back.out(1.6)",
          },
          1.1,
        )
        .fromTo(
          "[data-thread]",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut" },
          0.9,
        );
      // gentle depth on scroll
      gsap.to("[data-hero-zoom]", {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [play] },
  );

  const show3d = tier === "full" || tier === "lite";

  const controls = (light: boolean, className: string) => (
    <div
      data-hero-fade
      className={cn(
        "flex items-center gap-3",
        light ? "text-cream-50" : "text-cocoa",
        className,
      )}
    >
      <span className="font-display text-[0.9rem] font-medium tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex flex-1 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => go(i)}
            className="relative h-6 flex-1"
            aria-label={`Show ${s.name}`}
            aria-current={i === index}
          >
            <span
              className={cn(
                "absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full",
                light ? "bg-cream-50/30" : "bg-cocoa/15",
              )}
            >
              <span
                data-bar={i}
                className={cn(
                  "block h-full origin-left rounded-full",
                  light ? "bg-cream-50" : "bg-cocoa",
                )}
                style={{
                  transform: `scaleX(${i < index || (reduced && i === index) ? 1 : 0})`,
                }}
              />
            </span>
          </button>
        ))}
      </div>
      <span
        className={cn(
          "font-display text-[0.9rem] font-medium tabular-nums",
          light ? "text-cream-50/70" : "text-cocoa-400",
        )}
      >
        {String(n).padStart(2, "0")}
      </span>
    </div>
  );

  return (
    <section
      ref={root}
      className="relative isolate -mt-[72px] overflow-hidden lg:-mt-[84px]"
      aria-label="Introduction"
    >
      {/* soft colour wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[4%] h-[38rem] w-[38rem] rounded-full bg-sage-200/45 blur-[130px]" />
        <div className="absolute bottom-[-14rem] left-[-10rem] h-[32rem] w-[32rem] rounded-full bg-coral-200/35 blur-[130px]" />
      </div>

      <div className="container-kt relative grid gap-x-6 gap-y-9 pt-[88px] pb-12 lg:min-h-[calc(100svh-2.25rem)] lg:grid-cols-12 lg:pt-[112px] lg:pb-10">
        {/* the brand's thread: runs under the copy, loops into a little heart (as in the logo) and tucks behind the photo */}
        <svg
          aria-hidden
          viewBox="0 0 900 150"
          fill="none"
          className="pointer-events-none absolute bottom-[3%] left-0 z-0 hidden w-[61%] text-honey lg:block"
        >
          <path
            data-thread
            pathLength={1}
            strokeDasharray="1"
            d="M-20 128 C 110 132, 220 126, 300 100 C 258 72, 228 48, 243 26 C 256 8, 290 11, 300 35 C 310 11, 344 8, 357 26 C 372 48, 342 72, 300 100 C 384 128, 560 140, 900 108"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* copy */}
        <div className="relative z-10 order-2 self-center lg:order-none lg:col-span-7 lg:row-start-1">
          <p
            data-hero-fade
            data-reveal
            className="hidden items-center gap-2.5 rounded-full sm:inline-flex border border-cocoa/10 bg-cream-50/70 py-1.5 pr-4 pl-2 text-[0.78rem] font-medium text-cocoa-600 backdrop-blur"
          >
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-sage-100">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-sage-500/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-sage-600" />
            </span>
            {content.eyebrow}
          </p>

          <h1
            className="font-display sm:mt-7 text-[clamp(3.1rem,0.6rem+6vw,7.25rem)] leading-[0.92] font-medium tracking-[-0.055em] text-cocoa"
            aria-label={content.heading}
          >
            {lines.map((line, li) => (
              <span key={li} className="block" aria-hidden>
                {line.map((w, i) => {
                  const accent =
                    li === lines.length - 1 &&
                    i === line.length - 1 &&
                    lines.length > 1;
                  return (
                    <span
                      key={i}
                      className="inline-block overflow-hidden pb-[0.08em] align-top"
                    >
                      <span
                        data-hero-word
                        className={cn(
                          "inline-block",
                          accent &&
                            "font-serif-accent pr-[0.05em] font-normal tracking-[-0.02em] text-sage-700",
                        )}
                      >
                        {w}
                      </span>
                      {i < line.length - 1 && (
                        <span className="inline-block w-[0.24em]" />
                      )}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p
            data-hero-fade
            data-reveal
            className="mt-5 max-w-[30rem] text-[0.98rem] leading-relaxed text-cocoa-500 sm:mt-7 md:text-[1.08rem]"
          >
            {content.subheading}
          </p>

          <div
            data-hero-fade
            data-reveal
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4 sm:mt-9 sm:gap-x-7"
          >
            <Magnetic>
              <Link
                href={content.primary.href}
                className={buttonClass(
                  "primary",
                  "lg",
                  "group h-14 pr-2 pl-6 text-[0.95rem] sm:h-[3.75rem] sm:pl-7 sm:text-[0.98rem]",
                )}
              >
                {content.primary.label}
                <span className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-cream-50 sm:ml-2 sm:h-11 sm:w-11 text-cocoa transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-[1.1rem] w-[1.1rem]" />
                </span>
              </Link>
            </Magnetic>
            <Link
              href={content.secondary.href}
              className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-cocoa"
            >
              <span className="link-underline">{content.secondary.label}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* photo stage */}
        <div className="relative z-20 order-1 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1">
          <div
            ref={stage}
            data-hero-stage
            data-cursor="View"
            className="relative aspect-[1/1.06] w-full cursor-pointer overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-cream-200 sm:aspect-[4/5] sm:rounded-b-[2.5rem] lg:aspect-auto lg:h-full lg:min-h-[560px]"
            onPointerEnter={() => (pointer.current.inside = true)}
            onPointerLeave={() => (pointer.current.inside = false)}
            onClick={() => router.push(slide.href)}
            role="link"
            aria-label={`Shop ${slide.name}`}
            tabIndex={-1}
          >
            <div data-hero-stage-inner className="absolute inset-0">
              <div data-hero-zoom className="absolute inset-0">
                {/* still photos: first paint, fallback for low-power devices and reduced motion */}
                {slides.map((s, i) => (
                  <Image
                    key={s.image}
                    src={s.image}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className={cn(
                      "object-cover transition-opacity duration-700",
                      i === index ? "opacity-100" : "opacity-0",
                    )}
                  />
                ))}
                {show3d && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700",
                      glReady ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <LiquidSlideshow
                      srcs={slides.map((s) => s.image)}
                      index={index}
                      active={inView}
                      lite={tier === "lite"}
                      pointer={pointer}
                      onReady={() => setGlReady(true)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cocoa-900/40 to-transparent"
            />
          </div>

          {/* rotating badge */}
          <Link
            href="/collections/new-arrivals"
            data-hero-pop
            className="group absolute top-[14%] -left-3 z-20 grid h-[6.5rem] w-[6.5rem] place-items-center rounded-full bg-cream-50 shadow-[0_18px_40px_-18px_rgb(20_16_12/0.45)] sm:h-32 sm:w-32 lg:-left-16"
            aria-label="Shop new arrivals"
          >
            <svg
              viewBox="0 0 120 120"
              className="absolute inset-1.5 animate-[spin_16s_linear_infinite] text-cocoa"
              aria-hidden
            >
              <defs>
                <path
                  id="kt-badge-circle"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="fill-current text-[9.5px] font-semibold tracking-[0.18em] uppercase">
                <textPath
                  href="#kt-badge-circle"
                  textLength={286}
                  lengthAdjust="spacing"
                >
                  {badge}
                </textPath>
              </text>
            </svg>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45 sm:h-12 sm:w-12">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>

          {/* slide progress — on the photo (tablets & desktop) */}
          {n > 1 &&
            controls(
              true,
              "absolute right-6 bottom-7 z-20 hidden w-[15rem] lg:flex",
            )}

          {/* product on the current photo */}
          <div
            data-hero-pop
            className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[20rem] lg:-left-14"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={slide.href}
                  className="group flex items-center gap-3.5 rounded-[1.4rem] border border-white/40 bg-cream-50/80 p-2.5 pr-3.5 shadow-[0_24px_50px_-24px_rgb(20_16_12/0.5)] backdrop-blur-xl backdrop-saturate-150"
                >
                  <span className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-[0.9rem] bg-cream-200">
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">
                      {slide.label}
                      {slide.isSample && (
                        <span className="rounded-full border border-cocoa/10 px-1.5 py-px text-[0.58rem] tracking-[0.1em]">
                          Sample
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.95rem] font-semibold tracking-[-0.01em] text-cocoa">
                      {slide.name}
                    </span>
                    <span className="mt-0.5 flex items-baseline gap-2 text-[0.85rem]">
                      <span className="font-semibold text-cocoa">
                        {formatPrice(slide.price)}
                      </span>
                      {slide.compareAt && slide.compareAt > slide.price && (
                        <span className="text-cocoa-400 line-through">
                          {formatPrice(slide.compareAt)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* slide progress — phones */}
        {n > 1 && controls(false, "order-3 lg:hidden")}
      </div>
    </section>
  );
}
