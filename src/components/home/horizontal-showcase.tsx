"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { ProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Desktop: the section pins and vertical scrolling moves the products sideways.
 * Touch / small screens / reduced motion: a native swipeable row with snap points.
 */
export function HorizontalShowcase({
  eyebrow,
  title,
  accent,
  body,
  link,
  products,
  showSample,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  body?: string;
  link: { href: string; label: string };
  products: ProductCardData[];
  showSample: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - el.clientWidth);
        gsap.to(el.children, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
      <div className="container-kt flex flex-wrap items-end justify-between gap-6 pb-10 lg:pb-12">
        <div className="max-w-2xl">
          <p className="eyebrow eyebrow-rule">{eyebrow}</p>
          <h2 className="display-lg mt-5">
            {title} {accent && <span className="font-serif-accent text-sage-700">{accent}</span>}
          </h2>
          {body && <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-cocoa-500">{body}</p>}
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden h-px w-40 overflow-hidden bg-cocoa/10 lg:block" aria-hidden>
            <div ref={bar} className="h-full origin-left scale-x-0 bg-cocoa" />
          </div>
          <Link href={link.href} className="group inline-flex items-center gap-2 text-[0.9rem] font-semibold">
            <span className="link-underline">{link.label}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
      <div
        ref={track}
        className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:gap-5 md:px-8 lg:snap-none lg:overflow-visible xl:px-12"
      >
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} showSample={showSample} priority={i < 2} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[23vw] xl:w-[20vw]" />
        ))}
        <Link
          href={link.href}
          className="group flex aspect-[4/5] w-[68vw] shrink-0 snap-start flex-col justify-between rounded-[1.25rem] bg-cocoa p-6 text-cream-50 sm:w-[42vw] md:w-[30vw] lg:w-[23vw] xl:w-[20vw]"
        >
          <span className="text-[0.75rem] font-medium tracking-[0.14em] text-cream-200 uppercase">The full edit</span>
          <span className="font-display text-[2.2rem] leading-[1] font-medium tracking-[-0.04em]">
            {link.label}
            <ArrowUpRight className="mt-4 h-8 w-8 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </Link>
        <span className="w-px shrink-0" aria-hidden />
      </div>
    </section>
  );
}
