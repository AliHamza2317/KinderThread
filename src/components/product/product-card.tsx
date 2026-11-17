"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { cn, discountPercent } from "@/lib/utils";
import { useUi } from "@/stores/ui";
import { WishlistButton } from "./wishlist-button";

function sizeRange(sizes: string[]) {
  if (!sizes.length) return "";
  const short = (s: string) => s.replace("-", "–");
  return sizes.length === 1 ? short(sizes[0]) : `${short(sizes[0]).split("–")[0]}${/M$/.test(sizes[0]) && /Y$/.test(sizes.at(-1)!) ? "M" : ""}–${short(sizes.at(-1)!).split("–")[1]}`;
}

export function ProductCard({ product, priority, showSample = true, className }: { product: ProductCardData; priority?: boolean; showSample?: boolean; className?: string }) {
  const openQuickAdd = useUi((s) => s.openQuickAdd);
  const [a, b] = product.images;
  const off = discountPercent(product.price, product.compareAtPrice);
  return (
    <article className={cn("group/card relative", className)}>
      <div className="relative overflow-hidden rounded-[1.25rem] bg-cream-100 [mask-image:radial-gradient(white,black)]">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5]" aria-label={product.name} data-cursor="View">
          {a && (
            <Image
              src={a.url}
              alt={a.alt || product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
              className={cn("object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-soft)] group-hover/card:scale-[1.06]", b && "group-hover/card:opacity-0")}
            />
          )}
          {b && (
            <Image
              src={b.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
              className="scale-[1.04] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-soft)] group-hover/card:scale-100 group-hover/card:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {!product.inStock ? <Badge tone="out">Sold out</Badge> : off > 0 ? <Badge tone="sale">−{off}%</Badge> : product.isNewArrival ? <Badge tone="new">New</Badge> : null}
        </div>
        <WishlistButton productId={product.id} name={product.name} className="absolute top-3 right-3" />

        {product.inStock && (
          <>
            <button
              type="button"
              onClick={() => openQuickAdd(product)}
              className="absolute inset-x-3 bottom-3 hidden h-11 translate-y-3 items-center justify-center gap-2 rounded-full bg-cream-50/90 text-[0.8rem] font-semibold text-cocoa opacity-0 backdrop-blur-md transition duration-500 ease-[var(--ease-soft)] group-hover/card:translate-y-0 group-hover/card:opacity-100 hover:bg-cocoa hover:text-cream-50 focus-visible:translate-y-0 focus-visible:opacity-100 md:flex"
            >
              <Plus className="h-4 w-4" /> Quick add
            </button>
            <button
              type="button"
              onClick={() => openQuickAdd(product)}
              className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full bg-cream-50 text-cocoa md:hidden"
              aria-label={`Quick add ${product.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-sans text-[0.95rem] leading-snug font-medium tracking-[-0.01em]">
            <Link href={`/products/${product.slug}`} className="link-underline">
              {product.name}
            </Link>
          </h3>
          <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1" />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[0.75rem] text-cocoa-500">
        {product.colors.length > 0 && (
          <span className="flex items-center gap-1" aria-label={`Colours: ${product.colors.map((c) => c.name).join(", ")}`}>
            {product.colors.slice(0, 4).map((c) => (
              <span key={c.id} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
            ))}
            {product.colors.length > 4 && <span>+{product.colors.length - 4}</span>}
          </span>
        )}
        {product.sizes.length > 0 && <span>Sizes {sizeRange(product.sizes)}</span>}
        {showSample && product.isSample && (
          <span className="ml-auto rounded-full border border-cocoa/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase" title="Sample listing used while the first collection is prepared">
            Sample
          </span>
        )}
      </div>
    </article>
  );
}
