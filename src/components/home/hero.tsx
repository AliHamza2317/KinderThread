"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { buttonClass } from "@/components/ui/button";
import { detectDeviceTier, type DeviceTier } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const BearScene = dynamic(() => import("@/components/three/bear-scene"), { ssr: false });

type HeroContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export function Hero({ content, trust }: { content: HeroContent; trust: string[] }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // defer the 3D decision until the browser is idle so text paints first
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const go = () => setTier(detectDeviceTier());
    if (ric) ric(go, { timeout: 900 });
    else setTimeout(go, 200);
  }, []);

  useEffect(() => {
    if (!stage.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.current?.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-reveal-ready", ""));
      if (reduce) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-hero-eyebrow]", { y: 16, opacity: 0, duration: 0.9 })
        .from("[data-hero-word]", { yPercent: 115, duration: 1.2, stagger: 0.08 }, "-=0.6")
        .from("[data-hero-sub]", { y: 20, opacity: 0, duration: 1 }, "-=0.85")
        .from("[data-hero-cta] > *", { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.8")
        .from("[data-hero-trust] > *", { opacity: 0, duration: 0.8, stagger: 0.06 }, "-=0.6")
        .from("[data-hero-disc]", { scale: 0.85, opacity: 0, duration: 1.6 }, 0.1)
        .fromTo("[data-hero-thread]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut" }, 0.3);
    },
    { scope: root },
  );

  const words = content.heading.split(" ");
  // break into two lines after the first sentence when possible
  const firstStop = words.findIndex((w) => /[.!?]$/.test(w));
  const lines = firstStop >= 0 && firstStop < words.length - 1 ? [words.slice(0, firstStop + 1), words.slice(firstStop + 1)] : [words];
  const showCanvas = tier === "full" || tier === "lite";

  return (
    <section ref={root} className="relative overflow-hidden">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden>
        <path
          data-hero-thread
          pathLength={1}
          strokeDasharray="1"
          d="M-20 780 C 260 800, 430 740, 650 772 S 980 800, 1180 760 S 1380 730, 1460 750"
          fill="none"
          stroke="#EDAF4B"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity=".75"
        />
      </svg>

      <div className="container-kt relative grid min-h-[calc(100svh-108px)] items-center gap-6 pt-4 pb-14 lg:max-h-[880px] lg:min-h-[640px] lg:grid-cols-12 lg:gap-6 lg:py-10">
        {/* 3D stage */}
        <div ref={stage} className="relative order-1 mx-auto aspect-[1.1/1] w-full max-w-[520px] lg:order-2 lg:col-span-5 lg:max-w-none">
          <div data-hero-disc className="absolute inset-[8%] rounded-full bg-bear-100" aria-hidden />
          <Image
            src="/brand/hero-bear.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 90vw"
            className={cn("object-contain transition-opacity duration-700", showCanvas && ready ? "opacity-0" : "opacity-100")}
          />
          {showCanvas && (
            <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
              <BearScene tier={tier} active={visible} onReady={() => setReady(true)} />
            </div>
          )}
          {showCanvas && ready && (
            <p className="pointer-events-none absolute -bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-[0.72rem] font-semibold text-cocoa-400 md:flex" aria-hidden>
              <MousePointerClick className="h-3.5 w-3.5" /> Click the bear to say hello
            </p>
          )}
        </div>

        {/* copy */}
        <div className="order-2 text-center lg:order-1 lg:col-span-7 lg:text-left">
          <p data-hero-eyebrow data-reveal className="eyebrow eyebrow-rule justify-center lg:justify-start">
            {content.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.75rem,1rem+4.6vw,5.75rem)] leading-[0.98] font-[420] tracking-[-0.035em] text-cocoa" aria-label={content.heading}>
            {lines.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, i) => {
                  const last = li === lines.length - 1 && i === line.length - 1;
                  return (
                    <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top" aria-hidden>
                      <span data-hero-word className={cn("inline-block", last && "text-sage-600 italic")}>
                        {w}
                        {i < line.length - 1 ? " " : ""}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <p data-hero-sub className="mx-auto mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-cocoa-500 md:text-lg lg:mx-0">
            {content.subheading}
          </p>
          <div data-hero-cta className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Link href={content.primary.href} className={buttonClass("primary", "lg", "group")}>
              {content.primary.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href={content.secondary.href} className={buttonClass("secondary", "lg")}>
              {content.secondary.label}
            </Link>
          </div>
          {trust.length > 0 && (
            <ul data-hero-trust className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.8rem] font-semibold text-cocoa-500 lg:justify-start">
              {trust.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
