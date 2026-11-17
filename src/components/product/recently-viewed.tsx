"use client";

import { useEffect, useState } from "react";
import { productsByIdsAction } from "@/actions/storefront";
import type { ProductCardData } from "@/lib/catalog";
import { useRecent } from "@/stores/recent";
import { ProductCard } from "./product-card";

export function RecentlyViewed({ excludeId, showSample = true }: { excludeId?: string; showSample?: boolean }) {
  const ids = useRecent((s) => s.ids);
  const [items, setItems] = useState<ProductCardData[]>([]);
  const key = ids.filter((i) => i !== excludeId).slice(0, 4).join(",");
  useEffect(() => {
    if (!key) return setItems([]);
    productsByIdsAction(key.split(",")).then(setItems).catch(() => {});
  }, [key]);
  if (!items.length) return null;
  return (
    <section className="container-kt py-16" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="display-md mb-8">
        Recently viewed
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} showSample={showSample} />
          </li>
        ))}
      </ul>
    </section>
  );
}
