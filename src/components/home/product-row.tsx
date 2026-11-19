"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { ProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "./section-header";

/** A swipeable row of products (native scroll + snap); arrow buttons on larger screens. */
export function ProductRow({
  eyebrow,
  title,
  body,
  link,
  products,
  showSample,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  link: { href: string; label: string };
  products: ProductCardData[];
  showSample: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const move = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section>
      <div className="container-kt">
        <SectionHeader eyebrow={eyebrow} title={title} body={body} link={link}>
          <div className="hidden gap-2 md:flex">
            <button type="button" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/15 transition-colors hover:bg-cocoa hover:text-cream-50" aria-label="Scroll products left">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/15 transition-colors hover:bg-cocoa hover:text-cream-50" aria-label="Scroll products right">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SectionHeader>
      </div>
      <div
        ref={track}
        className="scrollbar-none flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:scroll-px-8 md:gap-5 md:px-8 xl:scroll-px-[max(3rem,calc((100vw-1440px)/2+3rem))] xl:px-[max(3rem,calc((100vw-1440px)/2+3rem))]"
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} showSample={showSample} priority={false} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[23vw] xl:w-[min(19vw,300px)]" />
        ))}
      </div>
    </section>
  );
}
