import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const AGES = [
  { id: "newborn", big: "0–6", unit: "months", label: "Newborn", image: "/images/editorial/cat-newborn.webp", tone: "bg-sage-100", span: "md:col-span-6 md:row-span-2" },
  { id: "baby", big: "6–12", unit: "months", label: "Baby", image: "/images/products/crochet-booties-cream.webp", tone: "bg-coral-100", span: "md:col-span-6" },
  { id: "toddler", big: "1–2", unit: "years", label: "Toddler", image: "/images/gallery/g1.webp", tone: "bg-sun-100", span: "md:col-span-3" },
  { id: "little", big: "2–5", unit: "years", label: "Little ones", image: "/images/products/linen-shirt-ivory.webp", tone: "bg-cream-200", span: "md:col-span-3" },
];

/** Bento of age ranges; the photograph slides in on hover. */
export function ShopByAge() {
  return (
    <Reveal stagger={0.08} className="grid auto-rows-[minmax(11rem,auto)] grid-cols-2 md:auto-rows-[minmax(13rem,auto)] gap-3 md:grid-cols-12 md:gap-4">
      {AGES.map((a, i) => (
        <Link
          key={a.id}
          href={`/shop?age=${a.id}`}
          data-cursor="Shop"
          className={cn("group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-5 md:rounded-[2rem] md:p-8", a.tone, a.span, i === 0 && "col-span-2 min-h-[15rem] md:col-span-6 md:min-h-[34rem]", i === 1 && "col-span-2")}
        >
          <Image
            src={a.image}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="scale-110 object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-soft)] group-hover:scale-100 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-cocoa-900/35 opacity-0 transition-opacity duration-700 group-hover:opacity-100" aria-hidden />
          <span className="relative flex items-center justify-between text-[0.75rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-500 group-hover:text-cream-50">
            {a.label}
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/70 text-cocoa backdrop-blur transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </span>
          <span className="relative transition-colors duration-500 group-hover:text-cream-50">
            <span className={cn("block font-display leading-[0.85] font-medium tracking-[-0.06em]", i === 0 ? "text-[clamp(4.5rem,3rem+8vw,11rem)]" : "text-[clamp(3rem,2rem+4vw,6rem)]")}>{a.big}</span>
            <span className="mt-2 block font-serif-accent text-[1.4rem] md:text-[1.8rem]">{a.unit}</span>
          </span>
        </Link>
      ))}
    </Reveal>
  );
}
