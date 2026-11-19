import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const AGES = [
  { label: "Newborn", range: "0–6M", href: "/shop?age=newborn" },
  { label: "Baby", range: "6–12M", href: "/shop?age=baby" },
  { label: "Toddler", range: "1–2Y", href: "/shop?age=toddler" },
  { label: "Little ones", range: "2–5Y", href: "/shop?age=little" },
];

/** Slim "shop by age" row under the hero — the quickest route for parents. */
export function AgeChips() {
  return (
    <nav aria-label="Shop by age" className="container-kt">
      <div className="flex flex-col items-center gap-3 py-5 md:flex-row md:justify-center md:gap-5 md:py-6">
        <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-cocoa-400 uppercase">Shop by age</p>
        <ul className="scrollbar-none -mx-5 flex max-w-[calc(100%+2.5rem)] gap-2 overflow-x-auto px-5 md:mx-0 md:max-w-none md:px-0">
          {AGES.map((a) => (
            <li key={a.href} className="shrink-0">
              <Link href={a.href} className="group inline-flex h-11 items-center gap-2 rounded-full border border-cocoa/12 bg-cream-50/70 px-4 text-[0.88rem] font-semibold whitespace-nowrap text-cocoa transition-colors hover:border-cocoa hover:bg-cocoa hover:text-cream-50">
                {a.label}
                <span className="text-[0.78rem] font-medium text-cocoa-400 transition-colors group-hover:text-cream-200">{a.range}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cocoa-300 transition-transform group-hover:rotate-45 group-hover:text-cream-200" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
