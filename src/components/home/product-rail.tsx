"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/catalog";

export function RailControls({ target }: { target: string }) {
  const scroll = (dir: number) => {
    const el = document.getElementById(target);
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 24) * 2, behavior: "smooth" });
  };
  const cls = "grid h-11 w-11 place-items-center rounded-full border border-cocoa-100 transition hover:border-cocoa hover:bg-cocoa hover:text-cream";
  return (
    <div className="hidden gap-2 md:flex">
      <button onClick={() => scroll(-1)} className={cls} aria-label="Previous products" aria-controls={target}>
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button onClick={() => scroll(1)} className={cls} aria-label="Next products" aria-controls={target}>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductRail({ id, products, showSample }: { id: string; products: ProductCardData[]; showSample: boolean }) {
  return (
    <ul id={id} className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 md:-mx-8 md:gap-6 md:scroll-px-8 md:px-8 xl:-mx-12 xl:scroll-px-12 xl:px-12">
      {products.map((p, i) => (
        <li key={p.id} className="w-[72vw] shrink-0 snap-start sm:w-[44vw] md:w-[31vw] lg:w-[23vw] xl:w-[300px]">
          <ProductCard product={p} priority={i < 2} showSample={showSample} />
        </li>
      ))}
    </ul>
  );
}
