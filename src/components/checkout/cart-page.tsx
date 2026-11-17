"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { FreeShippingMeter, refreshCartLines } from "@/components/layout/cart-drawer";
import { ButtonLink } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";
import { useHydrated } from "@/lib/hooks";
import { sizeLabel } from "@/lib/sizes";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/stores/cart";
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
      <div className="container-kt flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-cream-200">
          <ShoppingBag className="h-10 w-10 text-cocoa-400" />
        </span>
        <h1 className="display-md mt-6">Your bag is empty</h1>
        <p className="mt-3 text-cocoa-500">Little outfits are waiting for little adventures.</p>
        <ButtonLink href="/shop" className="mt-8">
          Start shopping
        </ButtonLink>
      </div>
    );

  return (
    <div className="container-kt py-10 md:py-14">
      <h1 className="display-lg">Your bag</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <ul className="divide-y divide-cocoa-100 border-y border-cocoa-100 lg:col-span-7">
          {lines.map((l) => {
            const issue = quote?.lines.find((q) => q.variantId === l.variantId)?.issue;
            return (
              <li key={l.variantId} className="flex gap-5 py-6">
                <Link href={`/products/${l.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md bg-cream-100 md:w-32">
                  {l.image && <Image src={l.image} alt="" fill sizes="128px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${l.slug}`} className="text-[1.02rem] font-semibold hover:underline">
                        {l.name}
                      </Link>
                      <p className="mt-1 text-sm text-cocoa-500">{[l.color, sizeLabel(l.size)].filter(Boolean).join(" · ")}</p>
                      <p className="mt-1 text-sm text-cocoa-500">{formatPrice(l.unitPrice)} each</p>
                      {issue && <p className="mt-1 text-sm font-semibold text-coral-700">{issue}</p>}
                    </div>
                    <p className="font-bold">{formatPrice(l.unitPrice * l.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
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
          <div className="sticky top-28 space-y-6 rounded-sm bg-cream-100 p-6 md:p-8">
            <h2 className="font-display text-2xl">Order summary</h2>
            <FreeShippingMeter subtotal={(quote?.subtotal ?? 0) - (quote?.discount ?? 0)} threshold={freeThreshold} />
            <CouponField value={couponCode} onApply={setCoupon} error={quote?.couponError} applied={quote?.coupon?.code} />
            <Totals quote={quote} showPaymentFee={false} />
            <ButtonLink href="/checkout" size="lg" className="w-full">
              Checkout
            </ButtonLink>
            <Link href="/shop" className="block text-center text-sm font-semibold text-cocoa-600 hover:underline">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
