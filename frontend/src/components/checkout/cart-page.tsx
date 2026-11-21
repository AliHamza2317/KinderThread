"use client";

import Image from "next/image";
import Link from "next/link";
import { Banknote, Lock, RotateCcw, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { FreeShippingMeter, refreshCartLines } from "@/components/layout/cart-drawer";
import { ButtonLink } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";
import { useHydrated } from "@/lib/hooks";
import { sizeLabel } from "@/lib/sizes";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { CheckoutSteps } from "./checkout-form";
import { CouponField, Totals } from "./order-summary";
import { useQuote } from "./use-quote";

export function CartPageClient({ freeThreshold }: { freeThreshold: number }) {
  const hydrated = useHydrated();
  const { lines, setQty, remove, replace, couponCode, setCoupon } = useCart();
  const { quote } = useQuote();

  useEffect(() => {
    if (!hydrated) return;
    refreshCartLines(useCart.getState().lines).then(({ lines: next, changed }) => changed && replace(next)).catch(() => {});
  }, [hydrated, replace]);

  if (!hydrated) return <div className="container-kt min-h-[50vh] py-16" />;

  if (!lines.length)
    return (
      <div className="border-b border-cocoa/[0.06] bg-cream-100">
        <div className="container-kt flex min-h-[50vh] flex-col items-center justify-center py-16 text-center md:py-20">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-cream-50">
            <ShoppingBag className="h-8 w-8 text-cocoa-400" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 font-display text-[clamp(1.65rem,0.9rem+2.6vw,3.2rem)] leading-[1.02] font-medium tracking-[-0.04em]">
            Your bag is <span className="font-serif-accent text-sage-700">empty</span>
          </h1>
          <p className="mt-3 text-cocoa-500">Little outfits are waiting for little adventures.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/collections/new-arrivals">Shop new arrivals</ButtonLink>
            <ButtonLink href="/shop" variant="secondary">
              Browse everything
            </ButtonLink>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container-kt py-8 md:py-12">
      <CheckoutSteps current={0} />
      <h1 className="display-lg mt-5">
        Your <span className="font-serif-accent text-sage-700">bag</span>
      </h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <ul className="space-y-3 lg:col-span-7">
          {lines.map((l) => {
            const issue = quote?.lines.find((q) => q.variantId === l.variantId)?.issue;
            return (
              <li key={l.variantId} className="flex gap-4 rounded-[1.75rem] border border-cocoa/10 bg-cream-50 p-3 md:gap-6 md:p-4">
                <Link href={`/products/${l.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-[1.1rem] bg-cream-100 md:w-32">
                  {l.image && <Image src={l.image} alt="" fill sizes="128px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${l.slug}`} className="font-display text-[1.15rem] tracking-[-0.02em] hover:underline md:text-[1.3rem]">
                        {l.name}
                      </Link>
                      <p className="mt-1 text-sm text-cocoa-500">{[l.color, sizeLabel(l.size)].filter(Boolean).join(" · ")}</p>
                      <p className="mt-1 text-sm text-cocoa-500">{formatPrice(l.unitPrice)} each</p>
                      {issue && <p className="mt-1 text-sm font-semibold text-coral-700">{issue}</p>}
                    </div>
                    <p className="font-semibold">{formatPrice(l.unitPrice * l.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 pr-1">
                    <QuantityStepper size="sm" value={l.quantity} max={Math.min(10, l.maxQty)} onChange={(v) => setQty(l.variantId, v)} />
                    <button onClick={() => remove(l.variantId)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa-500 hover:text-cocoa">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 space-y-6 rounded-[2rem] bg-cream-100 p-6 md:p-8">
            <h2 className="font-display text-[1.3rem] tracking-[-0.03em] md:text-[1.6rem]">Order summary</h2>
            <FreeShippingMeter subtotal={(quote?.subtotal ?? 0) - (quote?.discount ?? 0)} threshold={freeThreshold} />
            <CouponField value={couponCode} onApply={setCoupon} error={quote?.couponError} applied={quote?.coupon?.code} />
            <Totals quote={quote} showPaymentFee={false} />
            <ButtonLink href="/checkout" size="lg" className="w-full">
              <Lock className="h-4 w-4" /> Checkout
            </ButtonLink>
            <ul className="grid gap-2 text-[0.8rem] text-cocoa-500">
              <li className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-cocoa-400" strokeWidth={1.6} /> Cash on delivery available
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-cocoa-400" strokeWidth={1.6} /> Easy exchanges on unworn items
              </li>
            </ul>
            <Link href="/shop" className="block text-center text-sm font-semibold text-cocoa-600 hover:underline">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
