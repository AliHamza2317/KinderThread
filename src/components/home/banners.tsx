import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Banner = { id: string; eyebrow: string | null; title: string; subtitle: string | null; image: string | null; ctaLabel: string | null; ctaHref: string | null; tone: string };

const TONE: Record<string, string> = {
  sage: "bg-sage-100",
  sun: "bg-sun-100",
  coral: "bg-coral-100",
  cream: "bg-cream-200",
};

export function Banners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <Reveal stagger={0.12} className={cn("grid gap-5", banners.length > 1 && "md:grid-cols-2")}>
      {banners.map((b) => {
        const inner = (
          <div className={cn("group relative grid min-h-[320px] grid-cols-[1.1fr_1fr] items-center overflow-hidden rounded-[2rem]", TONE[b.tone] ?? TONE.cream)}>
            <div className="relative z-10 p-7 md:p-10">
              {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
              <h3 className="mt-3 font-display text-[2rem] leading-[1.02] md:text-[2.6rem]">{b.title}</h3>
              {b.subtitle && <p className="mt-3 max-w-xs text-[0.95rem] text-cocoa-600">{b.subtitle}</p>}
              {b.ctaLabel && b.ctaHref && (
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-3 text-[0.85rem] font-bold text-cream-50 transition group-hover:bg-cocoa-800">
                  {b.ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </div>
            <div className="relative h-full min-h-[320px]">
              {b.image && <Image src={b.image} alt="" fill sizes="(min-width: 768px) 22vw, 45vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />}
            </div>
          </div>
        );
        return b.ctaHref ? (
          <Link key={b.id} href={b.ctaHref} className="block">
            {inner}
          </Link>
        ) : (
          <div key={b.id}>{inner}</div>
        );
      })}
    </Reveal>
  );
}
