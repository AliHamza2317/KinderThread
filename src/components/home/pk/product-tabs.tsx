"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import { CenteredHeading } from "./centered-heading";

export type ProductTab = { label: string; href: string; products: ProductCardData[] };

/**
 * A centred product section with optional tabs (All / Girls / Boys / Newborn), a grid of
 * cards and a "View all" button under it, the way Minnie Minors and Bachaa Party show products.
 */
export function ProductTabs({ id, title, body, tabs, showSample, limit = 4 }: { id: string; title: string; body?: string; tabs: ProductTab[]; showSample: boolean; limit?: number }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  if (!tab) return null;
  return (
    <section className="container-kt" aria-labelledby={id}>
      <CenteredHeading id={id} title={title} body={body} />
      {tabs.length > 1 && (
        <div role="tablist" aria-label={`${title.replace(/\*/g, "")} filters`} className="scrollbar-none -mx-5 mb-7 flex justify-start gap-2 overflow-x-auto px-5 sm:justify-center md:mb-9">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(i)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-5 text-[0.82rem] font-semibold whitespace-nowrap transition-colors",
                i === active ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa/15 text-cocoa-600 hover:border-cocoa hover:text-cocoa",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div id={`${id}-panel`} role={tabs.length > 1 ? "tabpanel" : undefined}>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-9 md:gap-x-5 lg:grid-cols-4">
          {tab.products.slice(0, limit).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} showSample={showSample} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-9 flex justify-center md:mt-12">
        <Link href={tab.href} className="inline-flex h-12 items-center rounded-full bg-cocoa px-9 text-[0.8rem] font-semibold tracking-[0.14em] text-cream-50 uppercase transition-colors hover:bg-sage-700">
          View all
        </Link>
      </div>
    </section>
  );
}
