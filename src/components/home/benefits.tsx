"use client";

import Image from "next/image";
import { Feather, Gift, Heart, MessageCircle, Ruler, ShoppingBag, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { sparkles: Sparkles, feather: Feather, bag: ShoppingBag, chat: MessageCircle, truck: Truck, heart: Heart, ruler: Ruler, gift: Gift };
const TONES = ["bg-sage-100 text-sage-800", "bg-coral-100 text-coral-800", "bg-sun-100 text-sun-700", "bg-teal-100 text-teal-600", "bg-bear-100 text-cocoa-600"];

type Benefit = { title: string; body: string; icon: string; image: string };

/**
 * "Why Kinder Thread" as a short story: on desktop the photograph stays pinned
 * while the reasons scroll past, and the photo changes to match the one in focus.
 * Phones get each reason as its own card with its photo.
 */
export function Benefits({ items }: { items: Benefit[] }) {
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // the pinned photos sit clipped (invisible) until their turn, so the browser's lazy-loading
  // would never fetch them early — load them all once the section is close
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "900px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  const withImages = items.filter((b) => b.image).length > 0;
  const current = items[active] ?? items[0];
  const CurrentIcon = ICONS[current?.icon] ?? Sparkles;

  return (
    <div ref={root} className={cn("grid gap-12 lg:grid-cols-12 lg:gap-16", !withImages && "lg:grid-cols-1")}>
      {withImages && (
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-200 shadow-[0_40px_80px_-40px_rgb(20_16_12/0.45)]">
              {items.map((b, i) =>
                b.image && (near || i === 0) ? (
                  <div
                    key={b.title}
                    className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
                    style={{ clipPath: i === active ? "inset(0% 0% 0% 0%)" : i < active ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)", zIndex: i === active ? 2 : 1 }}
                  >
                    <Image src={b.image} alt="" fill loading="eager" sizes="(min-width: 1024px) 38vw, 1px" className={cn("object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]", i === active ? "scale-100" : "scale-110")} />
                  </div>
                ) : null,
              )}
              <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-cocoa-900/45 to-transparent" aria-hidden />
              {/* caption chip */}
              <div className="absolute inset-x-5 bottom-5 z-10 flex items-center gap-3 rounded-[1.25rem] border border-white/40 bg-cream-50/80 p-2.5 pr-4 backdrop-blur-xl" aria-hidden>
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-500", TONES[active % TONES.length])}>
                  <CurrentIcon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase tabular-nums">
                    {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <span className="block truncate text-[0.95rem] font-semibold text-cocoa">{current?.title}</span>
                </span>
              </div>
              {/* progress */}
              <div className="absolute top-5 right-5 z-10 flex flex-col gap-1.5" aria-hidden>
                {items.map((b, i) => (
                  <span key={b.title} className={cn("w-1.5 rounded-full bg-cream-50 transition-all duration-500", i === active ? "h-6 opacity-100" : "h-1.5 opacity-50")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ol className={cn(withImages ? "lg:col-span-7" : "", "flex flex-col gap-5 lg:gap-0")}>
        {items.map((b, i) => {
          const Icon = ICONS[b.icon] ?? Sparkles;
          const on = i === active;
          return (
            <li
              key={b.title}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-i={i}
              className={cn(
                "overflow-hidden rounded-[1.75rem] bg-cream-50 lg:flex lg:min-h-[52vh] lg:flex-col lg:justify-center lg:overflow-visible lg:rounded-none lg:border-t lg:border-cocoa/10 lg:bg-transparent lg:py-14 lg:transition-opacity lg:duration-700",
                !on && "lg:opacity-30",
              )}
            >
              {b.image && (
                <div className="relative aspect-[16/11] lg:hidden">
                  <Image src={b.image} alt="" fill sizes="100vw" className="object-cover" />
                </div>
              )}
              <div className="p-6 lg:p-0">
                <div className="flex items-center gap-4">
                  <span className={cn("grid h-12 w-12 place-items-center rounded-full lg:h-14 lg:w-14", TONES[i % TONES.length])}>
                    <Icon className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={1.6} />
                  </span>
                  <span className="font-display text-[0.95rem] font-medium text-cocoa-400 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-[clamp(1.8rem,1.1rem+2.4vw,3.6rem)] leading-[0.98] font-medium tracking-[-0.045em] text-cocoa lg:mt-7">{b.title}</h3>
                <p className="mt-3 max-w-lg text-[1rem] leading-relaxed text-cocoa-500 lg:mt-5 lg:text-[1.1rem]">{b.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
