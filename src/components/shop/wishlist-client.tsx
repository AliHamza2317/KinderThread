"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { productsByIdsAction } from "@/actions/storefront";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/catalog";
import { useHydrated } from "@/lib/hooks";
import { useWishlist } from "@/stores/wishlist";

export function WishlistClient({ showSample }: { showSample: boolean }) {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const [items, setItems] = useState<ProductCardData[] | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    if (!hydrated) return;
    if (!key) return setItems([]);
    productsByIdsAction(key.split(",")).then(setItems).catch(() => setItems([]));
  }, [key, hydrated]);

  return (
    <div className="container-kt py-10 md:py-14">
      <p className="eyebrow eyebrow-rule">Saved for later</p>
      <h1 className="display-lg mt-3">Wishlist</h1>
      {items === null ? (
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-cocoa-50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="stitch-border mt-10 flex flex-col items-center rounded-sm px-6 py-20 text-center">
          <Heart className="h-9 w-9 text-coral-500" />
          <p className="mt-4 font-display text-2xl">Your wishlist is empty</p>
          <p className="mt-2 max-w-sm text-cocoa-500">Tap the heart on any style to save it here for later.</p>
          <ButtonLink href="/shop" className="mt-6">
            Discover styles
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} showSample={showSample} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
