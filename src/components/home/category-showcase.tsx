"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; image: string | null; description: string | null; count: number };

/**
 * Desktop: tall photo panels side by side — the one you point at opens wide and
 * tells its story, the others fold into slim spines.
 * Phones/tablets: a swipeable row of tall cards.
 */
export function CategoryShowcase({ categories }: { categories: Cat[] }) {
  const [active, setActive] = useState(0);
  return (
    <>
      {/* desktop accordion */}
      <Reveal stagger={0.06} className="hidden h-[min(72vh,700px)] min-h-[520px] gap-3 lg:flex">
        {categories.map((c, i) => {
          const open = i === active;
          return (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              data-cursor="Shop"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={cn(
                "group relative min-w-0 overflow-hidden rounded-[2rem] bg-cream-200 transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                open ? "grow-[5]" : "grow",
              )}
              style={{ flexBasis: 0 }}
              aria-label={`${c.name} — ${c.count} ${c.count === 1 ? "piece" : "pieces"}`}
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 1px"
                  className={cn("object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "scale-100" : "scale-[1.15]")}
                />
              )}
              <div className={cn("absolute inset-0 transition-colors duration-700", open ? "bg-gradient-to-t from-cocoa-900/75 via-cocoa-900/10 to-transparent" : "bg-cocoa-900/35")} aria-hidden />

              {/* index */}
              <span className="absolute top-6 left-6 font-display text-[0.9rem] font-medium text-cream-50/90 tabular-nums">{String(i + 1).padStart(2, "0")}</span>

              {/* folded: vertical title */}
              <span
                className={cn(
                  "absolute bottom-7 left-1/2 origin-center -translate-x-1/2 font-display text-[1.6rem] font-medium tracking-[-0.03em] whitespace-nowrap text-cream-50 transition-opacity duration-500 [writing-mode:vertical-rl] rotate-180",
                  open ? "opacity-0" : "opacity-100 delay-300",
                )}
                aria-hidden
              >
                {c.name}
              </span>

              {/* open: details */}
              <span className={cn("absolute top-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-cream-50 text-cocoa transition-all duration-500", open ? "scale-100 opacity-100 group-hover:rotate-45" : "scale-50 opacity-0")}>
                <ArrowUpRight className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 flex w-[min(34rem,100%)] flex-col p-9 text-cream-50 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open ? "translate-y-0 opacity-100 delay-200" : "pointer-events-none translate-y-6 opacity-0",
                )}
              >
                <span className="w-fit rounded-full border border-cream-50/30 bg-cream-50/10 px-3 py-1 text-[0.75rem] font-medium backdrop-blur-md">
                  {c.count} {c.count === 1 ? "piece" : "pieces"}
                </span>
                <span className="mt-4 font-display text-[clamp(2.4rem,1.2rem+2.4vw,3.8rem)] leading-[0.95] font-medium tracking-[-0.045em]">{c.name}</span>
                {c.description && <span className="mt-3 max-w-sm text-[0.98rem] leading-relaxed text-cream-100/85">{c.description}</span>}
                <span className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-cream-50 pr-2 pl-5 text-[0.88rem] font-semibold text-cocoa">
                  Shop {c.name}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa text-cream-50">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </Reveal>

      {/* phones & tablets: swipe row */}
      <div className="-mx-5 md:-mx-8 lg:hidden">
        <Reveal stagger={0.06} className="scrollbar-none flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:scroll-px-8 md:px-8">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/collections/${c.slug}`} className="group relative aspect-[3/4] w-[76vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-cream-200 sm:w-[46vw] md:w-[36vw]">
              {c.image && <Image src={c.image} alt="" fill sizes="(min-width: 640px) 46vw, 76vw" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/75 via-cocoa-900/5 to-transparent" aria-hidden />
              <span className="absolute top-5 left-5 font-display text-[0.85rem] font-medium text-cream-50/90 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-cream-50 text-cocoa">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-6 text-cream-50">
                <span className="text-[0.75rem] font-medium text-cream-100/80">
                  {c.count} {c.count === 1 ? "piece" : "pieces"}
                </span>
                <span className="mt-1 block font-display text-[2rem] leading-[1] font-medium tracking-[-0.04em]">{c.name}</span>
                {c.description && <span className="mt-2 line-clamp-2 block text-[0.88rem] leading-snug text-cream-100/85">{c.description}</span>}
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </>
  );
}
