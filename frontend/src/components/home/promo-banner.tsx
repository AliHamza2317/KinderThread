import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Countdown } from "./countdown";

export type Promo = { eyebrow: string; title: string; body: string; ctaLabel: string; ctaHref: string; endsAt: string; image: string };

/** Seasonal campaign / sale slot (Eid, 11.11, winter sale…) with an optional countdown. Off by default. */
export function PromoBanner({ promo }: { promo: Promo }) {
  return (
    <section className="container-kt">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-cocoa text-cream-50 md:rounded-[3rem] lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center p-8 md:p-14 lg:p-16">
          {promo.eyebrow && <p className="eyebrow eyebrow-rule text-cream-200">{promo.eyebrow}</p>}
          <h2 className="display-lg mt-5 text-cream-50">{promo.title}</h2>
          {promo.body && <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-cream-200/85">{promo.body}</p>}
          {promo.endsAt && (
            <div className="max-w-md [&_dd]:text-cocoa [&_dl]:grid [&_dl]:grid-cols-4 [&_dl]:gap-2 [&_dl>div]:min-w-0 [&_dl>div]:rounded-2xl [&_dl>div]:bg-cream-50 [&_dl>div]:px-1 [&_dt]:text-[0.6rem] [&_dt]:tracking-[0.1em] [&_dt]:text-cocoa-500 sm:[&_dl]:gap-3 sm:[&_dt]:text-[0.68rem]">
              <Countdown to={promo.endsAt} label="Time left" />
            </div>
          )}
          {promo.ctaLabel && promo.ctaHref && (
            <Link href={promo.ctaHref} className="group mt-8 inline-flex h-14 w-fit items-center gap-2 rounded-full bg-cream-50 pr-2 pl-6 text-[0.95rem] font-semibold text-cocoa">
              {promo.ctaLabel}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          )}
        </div>
        {promo.image && (
          <div className="relative min-h-[18rem] lg:min-h-[30rem]">
            <Image src={promo.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}
