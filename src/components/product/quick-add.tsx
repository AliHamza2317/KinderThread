"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity";
import type { ProductCardData } from "@/lib/catalog";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { ColorSwatches, SizeGrid } from "./swatches";
import { useVariantSelection } from "./use-variant";

export function QuickAddModal() {
  const product = useUi((s) => s.quickAdd);
  const close = useUi((s) => s.openQuickAdd);
  return (
    <Modal open={!!product} onClose={() => close(null)} title={product?.name ?? "Quick add"} hideTitle className="sm:max-w-2xl">
      {product && <QuickAddBody key={product.id} product={product} onDone={() => close(null)} />}
    </Modal>
  );
}

function QuickAddBody({ product, onDone }: { product: ProductCardData; onDone: () => void }) {
  const sel = useVariantSelection(product.variants, product.colors);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  useEffect(() => setError(""), [sel.size, sel.colorId]);

  const onAdd = () => {
    if (!sel.selected) return setError("Please choose a size.");
    add(
      {
        variantId: sel.selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? null,
        size: sel.selected.size,
        color: sel.color?.name ?? null,
        unitPrice: sel.selected.price,
        maxQty: sel.selected.stock,
      },
      qty,
    );
    onDone();
    setOpen(true);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-2xl bg-cream-100 sm:block">
        {product.images[0] && <Image src={product.images[0].url} alt={product.images[0].alt} fill sizes="220px" className="object-cover" />}
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="font-display text-2xl">{product.name}</h3>
          <Price price={sel.selected?.price ?? product.price} compareAt={product.compareAtPrice} className="mt-1" />
        </div>
        {product.colors.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">
              Colour: <span className="font-normal text-cocoa-500">{sel.color?.name}</span>
            </p>
            <ColorSwatches colors={product.colors} value={sel.colorId} onChange={sel.setColorId} hasStock={sel.colorHasStock} />
          </div>
        )}
        <div>
          <p className="mb-2 text-sm font-semibold">Size (age)</p>
          <SizeGrid sizes={sel.sizes} value={sel.size} onChange={sel.setSize} stockFor={sel.stockFor} compact />
          {error && (
            <p className="mt-2 text-sm font-medium text-coral-700" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(10, sel.selected?.stock ?? 10))} />
          <Button className="flex-1" onClick={onAdd}>
            Add to bag
          </Button>
        </div>
        <Link href={`/products/${product.slug}`} onClick={onDone} className="text-sm font-semibold text-sage-700 link-underline self-start">
          View full details
        </Link>
      </div>
    </div>
  );
}
