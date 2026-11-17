"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HeroContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  image: string;
  imageAlt: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export function Hero({ content, trust }: { content: HeroContent; trust: string[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      root.current?.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-reveal-ready", ""));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo("[data-hero-img]", { scale: 1.08 }, { scale: 1, duration: 2.2 }, 0)
        .from("[data-hero-eyebrow]", { y: 14, opacity: 0, duration: 1 }, 0.2)
        .from("[data-hero-word]", { yPercent: 110, duration: 1.3, stagger: 0.07 }, 0.3)
        .from("[data-hero-sub]", { y: 18, opacity: 0, duration: 1.1 }, 0.7)
        .from("[data-hero-cta] > *", { y: 14, opacity: 0, duration: 1, stagger: 0.08 }, 0.85)
        .from("[data-hero-trust] > *", { opacity: 0, duration: 1, stagger: 0.06 }, 1);
      // gentle parallax on the photograph
      gsap.to("[data-hero-img]", { yPercent: 6, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  const words = content.heading.split(" ");
  const firstStop = words.findIndex((w) => /[.!?]$/.test(w));
  const lines = firstStop >= 0 && firstStop < words.length - 1 ? [words.slice(0, firstStop + 1), words.slice(firstStop + 1)] : [words];

  return (
    <section ref={root} className="relative isolate overflow-hidden lg:grid lg:min-h-[min(calc(100svh-108px),880px)] lg:grid-cols-2">
      {/* photograph — full-bleed behind the copy on phones, its own column on desktop */}
      <div className="absolute inset-0 -z-10 overflow-hidden lg:relative lg:inset-auto lg:z-0 lg:order-2">
        <Image
          data-hero-img
          src={content.image}
          alt={content.imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover will-change-transform"
        />
        {/* legibility scrim for text over the photo (phones only) */}
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/80 via-cocoa-900/25 to-transparent lg:hidden" aria-hidden />
      </div>

      <div className="flex min-h-[min(calc(100svh-108px),760px)] items-end px-5 pt-48 pb-10 text-cream-50 sm:px-10 lg:order-1 lg:min-h-0 lg:items-center lg:bg-cream lg:px-12 lg:py-16 lg:text-cocoa xl:px-20">
        <div className="max-w-xl">
          <p data-hero-eyebrow data-reveal className="eyebrow eyebrow-rule text-cream-100 lg:text-cocoa-500">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,1.2rem+4vw,5.25rem)] leading-[1.02] font-[370] tracking-[-0.03em] lg:mt-6" aria-label={content.heading}>
            {lines.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, i) => {
                  const last = li === lines.length - 1 && i === line.length - 1;
                  return (
                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top" aria-hidden>
                      <span data-hero-word className={cn("inline-block", last && "italic lg:text-sage-700")}>
                        {w}
                        {i < line.length - 1 ? " " : ""}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <p data-hero-sub className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-cream-100/90 sm:text-[1.05rem] lg:mt-6 lg:text-cocoa-500 [@media(max-height:620px)_and_(max-width:1023px)]:hidden">
            {content.subheading}
          </p>
          <div data-hero-cta className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-9 lg:gap-3">
            <Link href={content.primary.href} className={buttonClass("primary", "lg", "group max-lg:h-12 max-lg:bg-cream-50 max-lg:px-6 max-lg:text-cocoa-800 max-lg:hover:bg-white")}>
              {content.primary.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {/* phones: a quiet text link keeps both actions on one line */}
            <Link href={content.secondary.href} className="border-b border-cream-50/70 pb-1 text-[0.7rem] font-bold tracking-[0.14em] uppercase lg:hidden">
              {content.secondary.label}
            </Link>
            <Link href={content.secondary.href} className={buttonClass("secondary", "lg", "hidden lg:inline-flex")}>
              {content.secondary.label}
            </Link>
          </div>
          {trust.length > 0 && (
            <ul data-hero-trust className="mt-10 hidden flex-wrap gap-x-6 gap-y-2 border-t border-cocoa-100 pt-6 text-[0.72rem] font-bold tracking-[0.12em] text-cocoa-500 uppercase lg:flex">
              {trust.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
