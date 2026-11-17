"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { quoteCartAction } from "@/actions/storefront";
import { ButtonLink } from "@/components/ui/button";
import { Drawer } from "@/components/ui/overlay";
import { QuantityStepper } from "@/components/ui/quantity";
import { formatPrice } from "@/lib/utils";
import { sizeLabel } from "@/lib/sizes";
import { cartSubtotal, useCart, type CartLine } from "@/stores/cart";
import { toast } from "@/stores/toast";

/** Refresh client cart lines against live prices & stock. */
export async function refreshCartLines(lines: CartLine[]) {
  if (!lines.length) return { lines, changed: false };
  const quote = await quoteCartAction(lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
  const byId = new Map(quote.lines.map((q) => [q.variantId, q]));
  let changed = false;
  const next: CartLine[] = [];
  for (const l of lines) {
    const q = byId.get(l.variantId);
    if (!q || q.quantity === 0) {
      changed = true;
      continue;
    }
    if (q.unitPrice !== l.unitPrice || q.quantity !== l.quantity || q.stock !== l.maxQty) changed = true;
    next.push({ ...l, unitPrice: q.unitPrice, quantity: q.quantity, maxQty: q.stock, image: q.image ?? l.image, name: q.name });
  }
  return { lines: next, changed };
}

export function FreeShippingMeter({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div>
      <p className="text-[0.85rem] text-cocoa-600">
        {remaining > 0 ? (
          <>
            You&apos;re <strong className="text-cocoa">{formatPrice(remaining)}</strong> away from free delivery
          </>
        ) : (
          <strong className="text-sage-700">You&apos;ve unlocked free delivery ✦</strong>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cocoa-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-sage-500 transition-[width] duration-700 ease-[var(--ease-soft)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer({ freeThreshold }: { freeThreshold: number }) {
  const { lines, open, setOpen, setQty, remove, replace } = useCart();
  const syncing = useRef(false);

  useEffect(() => {
    if (!open || syncing.current) return;
    syncing.current = true;
    refreshCartLines(useCart.getState().lines)
      .then(({ lines: next, changed }) => {
        if (changed) {
          replace(next);
          toast({ title: "Your bag was updated", description: "Prices or availability changed since you added these items.", tone: "info" });
        }
      })
      .catch(() => {})
      .finally(() => (syncing.current = false));
  }, [open, replace]);

  const subtotal = cartSubtotal(lines);
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title={
        <>
          Your bag <span className="text-cocoa-400">({lines.reduce((n, l) => n + l.quantity, 0)})</span>
        </>
      }
      footer={
        lines.length ? (
          <div className="space-y-4">
            <FreeShippingMeter subtotal={subtotal} threshold={freeThreshold} />
            <div className="flex items-baseline justify-between">
              <span className="text-cocoa-600">Subtotal</span>
              <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-[0.8rem] text-cocoa-500">Delivery and discounts are calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href="/cart" variant="secondary" onClick={() => setOpen(false)}>
                View bag
              </ButtonLink>
              <ButtonLink href="/checkout" onClick={() => setOpen(false)}>
                Checkout
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-cream-200">
            <ShoppingBag className="h-8 w-8 text-cocoa-400" />
          </span>
          <p className="font-display text-2xl">Your bag is empty</p>
          <p className="text-sm text-cocoa-500">Little outfits are waiting for little adventures.</p>
          <ButtonLink href="/shop" onClick={() => setOpen(false)} className="mt-2">
            Start shopping
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-cocoa-100 px-6">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-4 py-5">
              <Link href={`/products/${l.slug}`} onClick={() => setOpen(false)} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                {l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${l.slug}`} onClick={() => setOpen(false)} className="font-semibold leading-snug hover:underline">
                    {l.name}
                  </Link>
                  <button onClick={() => remove(l.variantId)} className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-cocoa-400 hover:bg-cocoa-50 hover:text-cocoa" aria-label={`Remove ${l.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-0.5 text-[0.8rem] text-cocoa-500">
                  {[l.color, sizeLabel(l.size)].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper size="sm" value={l.quantity} max={Math.min(10, l.maxQty)} onChange={(v) => setQty(l.variantId, v)} />
                  <span className="font-bold">{formatPrice(l.unitPrice * l.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
