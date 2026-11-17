"use client";

import { Feather, Gift, Heart, MessageCircle, Ruler, ShoppingBag, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ICONS: Record<string, LucideIcon> = { sparkles: Sparkles, feather: Feather, bag: ShoppingBag, chat: MessageCircle, truck: Truck, heart: Heart, ruler: Ruler, gift: Gift };
const TONES = ["bg-sage-100 text-sage-900", "bg-coral-100 text-cocoa", "bg-sun-100 text-cocoa", "bg-cream-100 text-cocoa", "bg-cocoa text-cream-50"];

/** Cards that stack on top of each other as you scroll; earlier cards settle back. */
export function Benefits({ items }: { items: { title: string; body: string; icon: string }[] }) {
  const root = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.fromTo(card.firstElementChild, { scale: 1, filter: "brightness(1)" }, {
          scale: 0.92 + i * 0.012,
          filter: "brightness(0.96)",
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 15%", scrub: true },
        });
      });
    },
    { scope: root },
  );
  return (
    <ul ref={root} className="relative flex flex-col gap-4 md:gap-6">
      {items.map((b, i) => {
        const Icon = ICONS[b.icon] ?? Sparkles;
        return (
          <li key={b.title} data-card className="sticky" style={{ top: `calc(5.5rem + ${i * 1.1}rem)` }}>
            <div className={cn("grid min-h-[17rem] origin-top gap-8 rounded-[1.75rem] p-7 will-change-transform md:min-h-[21rem] md:grid-cols-12 md:rounded-[2.5rem] md:p-12", TONES[i % TONES.length])}>
              <div className="flex items-start justify-between md:col-span-5 md:flex-col">
                <span className="font-display text-[0.9rem] font-medium tabular-nums opacity-60">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
                <Icon className="h-10 w-10 md:h-14 md:w-14" strokeWidth={1.1} />
              </div>
              <div className="flex flex-col justify-end md:col-span-7">
                <h3 className="font-display text-[clamp(1.9rem,1.2rem+2.4vw,3.6rem)] leading-[0.98] font-medium tracking-[-0.045em]">{b.title}</h3>
                <p className="mt-4 max-w-lg text-[1rem] leading-relaxed opacity-80">{b.body}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
