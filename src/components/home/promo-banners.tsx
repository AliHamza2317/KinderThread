import Image from "next/image";
import Link from "next/link";
import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type PromoBannerItem = { eyebrow: string; title: string; ctaLabel: string; href: string; image: string; position?: string };

/** Two photo banners side by side (stacked on phones), as on Baby Planet. */
export function PromoPair({ items }: { items: PromoBannerItem[] }) {
  return (
    <section className="container-kt" aria-label="Featured edits">
      <div className="grid gap-3 md:grid-cols-2 md:gap-5">
        {items.map((b) => (
          <Link key={b.href} href={b.href} className="group relative block aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-cream-200 md:aspect-[16/12]">
            <Image src={b.image} alt="" fill sizes="(min-width: 768px) 48vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.04]" style={{ objectPosition: b.position ?? "50% 50%" }} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-cocoa-900/80 via-cocoa-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-cream-50 md:p-8 [&_.text-sage-700]:text-sun-200">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-cream-100/90 uppercase">{b.eyebrow}</p>
              <h3 className="mt-2 font-display text-[clamp(1.5rem,1rem+1.9vw,2.8rem)] leading-[1] font-medium tracking-[-0.04em]">
                <SplitWords text={b.title} />
              </h3>
              <span className="mt-5 inline-flex h-11 items-center rounded-full bg-cream-50 px-6 text-[0.76rem] font-semibold tracking-[0.14em] text-cocoa uppercase transition-colors group-hover:bg-sun-200">{b.ctaLabel}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** A full-width photo banner with a line and a button (the campaign strip mid-page). */
export function WideBanner({ eyebrow, title, body, ctaLabel, href, image, position, className }: PromoBannerItem & { body?: string; className?: string }) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)} aria-label={title.replace(/\*/g, "")}>
      <div className="relative h-[26rem] md:h-[30rem]">
        <Image src={image} alt="" fill sizes="100vw" className="-z-10 object-cover" style={{ objectPosition: position ?? "50% 50%" }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-cocoa-900/55" />
        <div className="container-kt flex h-full flex-col items-center justify-center text-center text-cream-50 [&_.text-sage-700]:text-sun-200">
          <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-cream-100/90 uppercase">{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.75rem,0.9rem+3.4vw,4.2rem)] leading-[1] font-medium tracking-[-0.045em]">
            <SplitWords text={title} />
          </h2>
          {body && <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-cream-100/90">{body}</p>}
          <Link href={href} className="mt-7 inline-flex h-12 items-center rounded-full bg-cream-50 px-8 text-[0.8rem] font-semibold tracking-[0.14em] text-cocoa uppercase transition-colors hover:bg-sun-200">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
