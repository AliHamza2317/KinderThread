import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Banner = { id: string; eyebrow: string | null; title: string; subtitle: string | null; image: string | null; ctaLabel: string | null; ctaHref: string | null; tone: string };

export function Banners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <Reveal stagger={0.12} className={cn("grid gap-4 md:gap-5", banners.length > 1 && "md:grid-cols-2")}>
      {banners.map((b) => {
        const inner = (
          <div className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-cocoa-100 sm:aspect-[16/11]">
            {b.image && <Image src={b.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-soft)] group-hover:scale-[1.04]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/70 via-cocoa-900/10 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-cream-50 md:p-10">
              {b.eyebrow && <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase opacity-90">{b.eyebrow}</p>}
              <h3 className="mt-2 font-display text-[2rem] leading-[1.05] font-[380] md:text-[2.6rem]">{b.title}</h3>
              {b.subtitle && <p className="mt-2 max-w-sm text-[0.95rem] text-cream-100/90">{b.subtitle}</p>}
              {b.ctaLabel && b.ctaHref && (
                <span className="mt-5 inline-block border-b border-cream-50/70 pb-1 text-[0.72rem] font-bold tracking-[0.16em] uppercase transition group-hover:border-cream-50">{b.ctaLabel}</span>
              )}
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
