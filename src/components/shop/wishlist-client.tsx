"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { productsByIdsAction } from "@/actions/storefront";
import { PageHero } from "@/components/layout/page-hero";
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
    productsByIdsAction(key.split(","))
      .then(setItems)
      .catch(() => setItems([]));
  }, [key, hydrated]);

  return (
    <>
      <PageHero
        eyebrow="Saved for later"
        title="Your *wishlist*"
        description="The pieces you've hearted, kept on this device."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        size="sm"
      />
      <div className="container-kt py-10 md:py-14">
        {items === null ? (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-cocoa-50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-cocoa/10 bg-cream-50 px-6 py-20 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-coral-50">
              <Heart className="h-7 w-7 text-coral-500" strokeWidth={1.6} />
            </span>
            <p className="mt-4 font-display text-2xl">Your wishlist is empty</p>
            <p className="mt-2 max-w-sm text-cocoa-500">
              Tap the heart on any style to save it here for later.
            </p>
            <ButtonLink href="/shop" className="mt-6">
              Discover styles
            </ButtonLink>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} showSample={showSample} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
