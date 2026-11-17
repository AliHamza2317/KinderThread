"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BearStage } from "./bear-stage";


type HeroContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export function Hero({ content, trust }: { content: HeroContent; trust: string[] }) {
  const root = useRef<HTMLElement>(null);

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

      <div className="container-kt relative grid items-center gap-3 pt-2 pb-14 sm:gap-6 sm:pt-4 lg:min-h-[calc(100svh-108px)] lg:max-h-[880px] lg:min-h-[640px] lg:grid-cols-12 lg:gap-6 lg:py-10">
        {/* 3D stage */}
        <BearStage className="order-1 mx-auto w-full max-w-[220px] [@media(max-height:620px)]:max-w-[170px] sm:max-w-[420px] lg:order-2 lg:col-span-5 lg:max-w-none" />

        {/* copy */}
        <div className="order-2 text-center lg:order-1 lg:col-span-7 lg:text-left">
          <p data-hero-eyebrow data-reveal className="eyebrow eyebrow-rule justify-center lg:justify-start">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 font-display sm:mt-5 text-[clamp(2.75rem,1rem+4.6vw,5.75rem)] leading-[0.98] font-[420] tracking-[-0.035em] text-cocoa" aria-label={content.heading}>
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
          <p data-hero-sub className="mx-auto mt-4 max-w-[34rem] sm:mt-6 [@media(max-height:620px)_and_(max-width:639px)]:hidden text-[1.05rem] leading-relaxed text-cocoa-500 md:text-lg lg:mx-0">
            {content.subheading}
          </p>
          <div data-hero-cta className="mt-6 flex items-center justify-center gap-3 sm:mt-8 lg:justify-start">
            <Link href={content.primary.href} className={buttonClass("primary", "lg", "group h-12 px-5 text-[0.88rem] sm:h-14 sm:px-8 sm:text-base")}>
              {content.primary.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href={content.secondary.href} className={buttonClass("secondary", "lg", "h-12 px-5 text-[0.88rem] sm:h-14 sm:px-8 sm:text-base")}>
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
