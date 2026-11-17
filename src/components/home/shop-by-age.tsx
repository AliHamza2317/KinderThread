import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const AGES = [
  { id: "newborn", big: "0–6", unit: "months", label: "Newborn" },
  { id: "baby", big: "6–12", unit: "months", label: "Baby" },
  { id: "toddler", big: "1–2", unit: "years", label: "Toddler" },
  { id: "little", big: "2–5", unit: "years", label: "Little ones" },
];

export function ShopByAge() {
  return (
    <Reveal stagger={0.08} className="grid grid-cols-2 border-t border-l border-cocoa-100 lg:grid-cols-4">
      {AGES.map((a) => (
        <Link
          key={a.id}
          href={`/shop?age=${a.id}`}
          className="group relative flex aspect-[5/4] flex-col justify-between border-r border-b border-cocoa-100 p-5 transition-colors duration-500 hover:bg-cocoa-800 hover:text-cream-50 md:p-8"
        >
          <span className="text-[0.7rem] font-bold tracking-[0.18em] text-cocoa-500 uppercase transition-colors group-hover:text-cream-200">{a.label}</span>
          <span>
            <span className="block font-display text-[clamp(2.4rem,1.6rem+3vw,4.5rem)] leading-none font-[350] tracking-[-0.03em]">{a.big}</span>
            <span className="mt-1 block text-[0.9rem] text-cocoa-500 transition-colors group-hover:text-cream-200">{a.unit}</span>
          </span>
          <ArrowUpRight className="absolute top-5 right-5 h-5 w-5 opacity-40 transition group-hover:opacity-100 md:top-8 md:right-8" strokeWidth={1.5} />
        </Link>
      ))}
    </Reveal>
  );
}
