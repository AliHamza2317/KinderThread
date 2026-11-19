import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonClass } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

export type HeroProduct = { href: string; name: string; label: string; image: string; price: number; compareAt: number | null; isSample: boolean };

type HeroContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  image: string;
  imageAlt: string;
  secondaryImage: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export const HERO_AGES = [
  { label: "Newborn", range: "0–6M", href: "/shop?age=newborn" },
  { label: "Baby", range: "6–12M", href: "/shop?age=baby" },
  { label: "Toddler", range: "1–2Y", href: "/shop?age=toddler" },
  { label: "Little ones", range: "2–5Y", href: "/shop?age=little" },
];

/**
 * Campaign hero: one strong photograph in an arched frame, the season's line,
 * and the quickest routes into the shop (CTA + age chips). Server-rendered and
 * visible on first paint; the entrance is a short CSS animation only.
 */
export function Hero({ content, product, badge }: { content: HeroContent; product: HeroProduct | null; badge: string }) {
  // "Little Moments. Big Adventures." → two lines; the last word gets the serif accent
  const words = content.heading.trim().split(/\s+/);
  const stop = words.findIndex((w) => /[.!?]$/.test(w));
  const lines = stop >= 0 && stop < words.length - 1 ? [words.slice(0, stop + 1), words.slice(stop + 1)] : [words];

  return (
    <section className="relative isolate -mt-[72px] overflow-hidden lg:-mt-[84px]" aria-label="Introduction">
      {/* soft wash behind the frame (static gradient, no blur filters) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_85%_20%,var(--color-sage-100)_0%,transparent_60%),radial-gradient(50%_50%_at_0%_100%,var(--color-coral-50)_0%,transparent_70%)]" />

      <div className="container-kt relative grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-6 pt-[84px] pb-10 sm:gap-y-8 lg:min-h-[calc(100svh-2.25rem)] lg:grid-cols-12 lg:items-center lg:pt-[112px] lg:pb-12">
        {/* the brand's thread: loops into a little heart (as in the logo) and tucks behind the photo */}
        <svg aria-hidden viewBox="0 0 900 150" fill="none" className="pointer-events-none absolute -bottom-9 left-0 z-0 hidden w-[54%] text-honey lg:block">
          <path
            className="kt-thread"
            pathLength={1}
            d="M-20 128 C 110 132, 220 126, 300 100 C 258 72, 228 48, 243 26 C 256 8, 290 11, 300 35 C 310 11, 344 8, 357 26 C 372 48, 342 72, 300 100 C 384 128, 560 140, 900 108"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* copy */}
        <div className="relative z-10 order-2 min-w-0 lg:order-none lg:col-span-6 lg:row-start-1">
          <p className="kt-enter hidden items-center gap-2.5 rounded-full border border-cocoa/10 bg-cream-50/80 py-1.5 pr-4 pl-2 text-[0.78rem] font-medium text-cocoa-600 sm:inline-flex">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-sage-100">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-600" />
            </span>
            {content.eyebrow}
          </p>

          <h1 className="font-display text-[clamp(3rem,0.4rem+6vw,7rem)] leading-[0.92] font-medium tracking-[-0.055em] text-cocoa sm:mt-7" aria-label={content.heading}>
            {lines.map((line, li) => (
              <span key={li} className="block" aria-hidden>
                {line.map((w, i) => {
                  const accent = li === lines.length - 1 && i === line.length - 1 && lines.length > 1;
                  return (
                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
                      <span className={cn("kt-word inline-block", accent && "font-serif-accent pr-[0.05em] font-normal tracking-[-0.02em] text-sage-700")} style={{ animationDelay: `${0.08 + (li * line.length + i) * 0.07}s` }}>
                        {w}
                      </span>
                      {i < line.length - 1 && <span className="inline-block w-[0.24em]" />}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p className="kt-enter mt-5 max-w-[30rem] text-[0.98rem] leading-relaxed text-cocoa-500 [animation-delay:0.3s] sm:mt-7 md:text-[1.08rem] [@media(max-height:760px)_and_(max-width:639px)]:hidden">{content.subheading}</p>

          <div className="kt-enter mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:0.4s] sm:mt-9">
            <Magnetic>
              <Link href={content.primary.href} className={buttonClass("primary", "lg", "group h-14 pr-2 pl-6 text-[0.95rem] sm:h-[3.75rem] sm:pl-7")}>
                {content.primary.label}
                <span className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-cream-50 text-cocoa transition-transform duration-500 group-hover:rotate-45 sm:ml-2 sm:h-11 sm:w-11">
                  <ArrowUpRight className="h-[1.1rem] w-[1.1rem]" />
                </span>
              </Link>
            </Magnetic>
            <Link href={content.secondary.href} className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-cocoa">
              <span className="link-underline">{content.secondary.label}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* fastest route for parents: shop by age */}
          <nav aria-label="Shop by age" className="kt-enter mt-9 [animation-delay:0.5s] lg:mt-12">
            <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-cocoa-400 uppercase">Shop by age</p>
            <ul className="scrollbar-none -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              {HERO_AGES.map((a) => (
                <li key={a.href} className="shrink-0">
                  <Link href={a.href} className="group inline-flex h-11 items-center gap-2 rounded-full border border-cocoa/12 bg-cream-50/70 pr-4 pl-4 text-[0.88rem] font-semibold text-cocoa transition-colors hover:border-cocoa hover:bg-cocoa hover:text-cream-50">
                    {a.label}
                    <span className="text-[0.78rem] font-medium text-cocoa-400 transition-colors group-hover:text-cream-200">{a.range}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* campaign photograph */}
        <div className="relative z-20 order-1 min-w-0 lg:order-none lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:pl-10 xl:pl-16">
          <div className="relative">
            <Link
              href={content.primary.href}
              className="relative block aspect-[5/4] w-full overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-cream-200 sm:aspect-[4/5] sm:rounded-b-[2.5rem] lg:aspect-auto lg:h-[min(calc(100svh-12rem),780px)] lg:min-h-[560px]"
              aria-label={content.primary.label}
            >
              <Image src={content.image} alt={content.imageAlt} fill priority sizes="(min-width: 1024px) 44vw, 100vw" className="kt-kenburns object-cover" />
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cocoa-900/35 to-transparent" />
            </Link>

            {/* second photograph, layered (desktop) */}
            {content.secondaryImage && (
              <div className="kt-pop absolute bottom-[12%] -left-16 z-10 hidden w-[34%] overflow-hidden rounded-[1.5rem] border-[6px] border-cream shadow-[0_30px_60px_-30px_rgb(20_16_12/0.55)] [animation-delay:0.7s] lg:block xl:-left-20">
                <div className="relative aspect-[4/5]">
                  <Image src={content.secondaryImage} alt="" fill sizes="16vw" className="object-cover" />
                </div>
              </div>
            )}

            {/* badge */}
            <Link
              href="/collections/new-arrivals"
              className="kt-pop group absolute top-[10%] -left-2 z-20 grid h-[6.25rem] w-[6.25rem] place-items-center rounded-full bg-cream-50 shadow-[0_18px_40px_-18px_rgb(20_16_12/0.45)] [animation-delay:0.9s] sm:h-32 sm:w-32 lg:-left-14"
              aria-label="Shop new arrivals"
            >
              <svg viewBox="0 0 120 120" className="absolute inset-1.5 text-cocoa transition-transform duration-[1.6s] ease-out group-hover:rotate-180" aria-hidden>
                <defs>
                  <path id="kt-badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <text className="fill-current text-[9.5px] font-semibold tracking-[0.18em] uppercase">
                  <textPath href="#kt-badge-circle" textLength={286} lengthAdjust="spacing">
                    {badge}
                  </textPath>
                </text>
              </svg>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45 sm:h-12 sm:w-12">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>

            {/* the product in the photograph */}
            {product && (
              <Link
                href={product.href}
                className="kt-pop group absolute inset-x-3 bottom-3 z-20 flex items-center gap-3 rounded-full border border-white/50 bg-cream-50/90 py-1.5 pr-1.5 pl-4 sm:gap-3.5 sm:rounded-[1.4rem] sm:p-2.5 sm:pr-3.5 shadow-[0_24px_50px_-24px_rgb(20_16_12/0.5)] backdrop-blur-md [animation-delay:1.1s] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[20rem]"
              >
                <span className="relative hidden h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-[0.9rem] bg-cream-200 sm:block">
                  <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="hidden items-center gap-2 text-[0.68rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase sm:flex">
                    {product.label}
                    {product.isSample && <span className="rounded-full border border-cocoa/10 px-1.5 py-px text-[0.58rem] tracking-[0.1em]">Sample</span>}
                  </span>
                  <span className="block truncate text-[0.88rem] font-semibold tracking-[-0.01em] text-cocoa sm:mt-0.5 sm:text-[0.95rem]">{product.name}</span>
                  <span className="flex items-baseline gap-2 text-[0.8rem] sm:mt-0.5 sm:text-[0.85rem]">
                    <span className="font-semibold text-cocoa">{formatPrice(product.price)}</span>
                    {product.compareAt && product.compareAt > product.price && <span className="text-cocoa-400 line-through">{formatPrice(product.compareAt)}</span>}
                  </span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
