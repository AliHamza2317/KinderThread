"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Truck, RotateCcw, Banknote } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity";
import { WhatsAppIcon } from "@/components/ui/social-icons";
import { cn, formatPrice, whatsappLink } from "@/lib/utils";
import { sizeLabel } from "@/lib/sizes";
import { useCart } from "@/stores/cart";
import { useRecent } from "@/stores/recent";
import { ColorSwatches, SizeGrid } from "./swatches";
import { SizeGuideButton, type SizeGuideData } from "./size-guide";
import { TryOnTeaser } from "./try-on";
import { useVariantSelection } from "./use-variant";
import { WishlistButton } from "./wishlist-button";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    isSample: boolean;
    isNewArrival: boolean;
    colors: { id: string; name: string; hex: string }[];
    variants: { id: string; size: string; colorId: string | null; stock: number; price: number; sku: string }[];
    images: { url: string; colorId: string | null }[];
  };
  sizeGuide: SizeGuideData | null;
  whatsapp: string;
  info: { freeThreshold: number; estimate: string; cod: boolean; returnDays: number };
  url: string;
  onColorChange?: (id: string | null) => void;
};

export function PurchasePanel({ product, sizeGuide, whatsapp, info, url }: Props) {
  const sel = useVariantSelection(product.variants, product.colors);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const pushRecent = useRecent((s) => s.push);
  const router = useRouter();
  const mainCta = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => pushRecent(product.id), [product.id, pushRecent]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("kt:color", { detail: sel.colorId }));
  }, [sel.colorId]);
  useEffect(() => setError(""), [sel.size, sel.colorId]);
  useEffect(() => {
    const el = mainCta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const anyStock = product.variants.some((v) => v.stock > 0);
  const stock = sel.selected?.stock ?? null;
  const price = sel.selected?.price ?? product.price;

  const addToCart = (buyNow = false) => {
    if (!sel.selected) {
      setError("Please choose a size.");
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    const img = product.images.find((i) => i.colorId === sel.colorId) ?? product.images[0];
    add(
      {
        variantId: sel.selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: img?.url ?? null,
        size: sel.selected.size,
        color: sel.color?.name ?? null,
        unitPrice: sel.selected.price,
        maxQty: sel.selected.stock,
      },
      qty,
    );
    if (buyNow) router.push("/checkout");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      setOpen(true);
    }
    return true;
  };

  const waText = `Hi Kinder Thread! I have a question about "${product.name}"${sel.color ? ` in ${sel.color.name}` : ""}${sel.size ? `, size ${sel.size}` : ""}. ${url}`;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="flex flex-wrap gap-2">
          {product.isNewArrival && <Badge tone="new">New</Badge>}
          {product.isSample && <Badge tone="sample">Sample listing</Badge>}
        </div>
        <h1 className="display-md mt-3">{product.name}</h1>
        <Price price={price} compareAt={product.compareAtPrice} size="lg" className="mt-3" />
        {info.cod && <p className="mt-1 text-[0.82rem] text-cocoa-500">Cash on delivery available</p>}
      </div>

      {product.colors.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold">
            Colour: <span className="font-normal text-cocoa-500">{sel.color?.name}</span>
          </p>
          <ColorSwatches colors={product.colors} value={sel.colorId} onChange={sel.setColorId} hasStock={sel.colorHasStock} />
        </div>
      )}

      <div id="size-picker">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Size (age){sel.size && <span className="font-normal text-cocoa-500"> · {sizeLabel(sel.size)}</span>}
          </p>
          <SizeGuideButton guide={sizeGuide} highlight={sel.size} />
        </div>
        <SizeGrid sizes={sel.sizes} value={sel.size} onChange={sel.setSize} stockFor={sel.stockFor} />
        <div className="mt-3 min-h-5 text-[0.85rem]" aria-live="polite">
          {error ? (
            <p className="font-medium text-coral-700" role="alert">
              {error}
            </p>
          ) : !anyStock ? (
            <p className="font-semibold text-cocoa-500">Sold out in all sizes</p>
          ) : stock == null ? (
            <p className="text-cocoa-500">Select a size to see availability</p>
          ) : stock <= 0 ? (
            <p className="font-semibold text-cocoa-500">Sold out in this size</p>
          ) : stock <= 3 ? (
            <p className="font-semibold text-coral-700">Only {stock} left in stock</p>
          ) : (
            <p className="flex items-center gap-1.5 font-semibold text-sage-700">
              <span className="h-2 w-2 rounded-full bg-sage-500" /> In stock
            </p>
          )}
        </div>
      </div>

      <div ref={mainCta} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(10, stock ?? 10))} />
          <Button size="lg" className="flex-1" disabled={!anyStock} onClick={() => addToCart(false)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added ? "y" : "n"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added
                  </>
                ) : anyStock ? (
                  "Add to bag"
                ) : (
                  "Sold out"
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
          <WishlistButton productId={product.id} name={product.name} variant="inline" />
        </div>
        <Button size="lg" variant="secondary" disabled={!anyStock} onClick={() => addToCart(true)}>
          Buy now
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {whatsapp && (
            <a href={whatsappLink(whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-cocoa-600 hover:text-cocoa">
              <WhatsAppIcon width={18} height={18} /> Ask on WhatsApp
            </a>
          )}
          <TryOnTeaser />
        </div>
      </div>

      <ul className="grid gap-3 rounded-[1.25rem] bg-cream-100 p-5 text-[0.85rem] text-cocoa-600">
        <li className="flex gap-3">
          <Truck className="h-5 w-5 shrink-0 text-sage-600" />
          <span>
            {info.estimate}.{info.freeThreshold > 0 && <> Free delivery over {formatPrice(info.freeThreshold)}.</>}
          </span>
        </li>
        {info.cod && (
          <li className="flex gap-3">
            <Banknote className="h-5 w-5 shrink-0 text-sage-600" /> Cash on delivery available across Pakistan.
          </li>
        )}
        {info.returnDays > 0 && (
          <li className="flex gap-3">
            <RotateCcw className="h-5 w-5 shrink-0 text-sage-600" /> Returns & exchanges within {info.returnDays} days of delivery.
          </li>
        )}
      </ul>

      {/* sticky mobile bar */}
      <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t border-cocoa-100 bg-cream/95 p-3 backdrop-blur transition-transform duration-500 md:hidden", showSticky ? "translate-y-0" : "translate-y-full")} aria-hidden={!showSticky}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-sm font-bold">{formatPrice(price)}</p>
          </div>
          <Button tabIndex={showSticky ? 0 : -1} disabled={!anyStock} onClick={() => addToCart(false)}>
            {sel.size ? "Add to bag" : "Choose size"}
          </Button>
        </div>
      </div>
    </div>
  );
}
