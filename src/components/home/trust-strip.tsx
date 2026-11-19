import Link from "next/link";
import { Banknote, MessageCircle, RefreshCw, Ruler, Truck, type LucideIcon } from "lucide-react";

export type TrustItem = { icon: "truck" | "cash" | "exchange" | "chat" | "ruler"; title: string; body: string; href?: string; external?: boolean };

const ICONS: Record<TrustItem["icon"], LucideIcon> = { truck: Truck, cash: Banknote, exchange: RefreshCw, chat: MessageCircle, ruler: Ruler };
const TONES = ["bg-sage-100 text-sage-800", "bg-sun-100 text-sun-700", "bg-coral-100 text-coral-800", "bg-teal-100 text-teal-600"];

/** The reassurances Pakistani parents look for first: COD, delivery, exchanges and help. */
export function TrustStrip({ items }: { items: TrustItem[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Shopping with Kinder Thread" className="container-kt">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-cocoa/[0.08] bg-cocoa/[0.08] lg:grid-cols-4">
        {items.map((t, i) => {
          const Icon = ICONS[t.icon];
          const inner = (
            <>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full md:h-11 md:w-11 ${TONES[i % TONES.length]}`}>
                <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.7} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.86rem] leading-tight font-semibold text-cocoa md:text-[0.92rem]">{t.title}</span>
                <span className="mt-0.5 block text-[0.75rem] leading-snug text-cocoa-500 md:text-[0.8rem]">{t.body}</span>
              </span>
            </>
          );
          const cls = "flex h-full items-center gap-3 bg-cream-50 p-4 md:gap-3.5 md:p-5";
          return (
            <li key={t.title}>
              {t.href ? (
                t.external ? (
                  <a href={t.href} target="_blank" rel="noopener noreferrer" className={`${cls} transition-colors hover:bg-cream-100`}>
                    {inner}
                  </a>
                ) : (
                  <Link href={t.href} className={`${cls} transition-colors hover:bg-cream-100`}>
                    {inner}
                  </Link>
                )
              ) : (
                <div className={cls}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
