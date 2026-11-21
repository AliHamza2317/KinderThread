"use client";

import { CheckoutSteps } from "./checkout-form";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useHydrated } from "@/lib/hooks";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { sizeLabel } from "@/lib/sizes";
import { formatPrice, whatsappLink } from "@/lib/utils";
import { useDemoOrders } from "@/stores/demo-orders";

export function OrderConfirmation({ number, whatsapp }: { number: string; whatsapp: string }) {
  const hydrated = useHydrated();
  const order = useDemoOrders((s) => s.orders.find((o) => o.number === number));

  if (!hydrated) return <div className="container-kt min-h-[60vh] py-16" />;
  if (!order)
    return (
      <div className="container-kt flex min-h-[55vh] max-w-xl flex-col items-center justify-center py-20 text-center">
        <h1 className="display-md">Order not found</h1>
        <p className="mt-3 text-cocoa-500">We couldn&apos;t find order {number} in this browser.</p>
        <ButtonLink href="/shop" className="mt-8">
          Continue shopping
        </ButtonLink>
      </div>
    );

  const manual = ["bank", "jazzcash", "easypaisa"].includes(order.paymentMethod);
  return (
    <div className="container-kt max-w-3xl py-14 md:py-20">
      <div className="mb-8 flex justify-center">
        <CheckoutSteps current={2} />
      </div>
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-sage-600" strokeWidth={1.2} />
        <p className="eyebrow eyebrow-rule mt-6 justify-center">Order placed</p>
        <h1 className="display-lg mt-3">Thank you, {order.customerName.split(" ")[0]}!</h1>
        <p className="mx-auto mt-4 max-w-lg text-cocoa-500">
          Your order <strong className="text-cocoa">{order.number}</strong> has been received. We&apos;ll call or message you on {order.phone} to confirm it before dispatch.
        </p>
        <p className="mx-auto mt-5 max-w-lg border-y border-cocoa-100 py-3 text-[0.8rem] text-cocoa-500">
          Demo confirmation — this preview doesn&apos;t send or charge anything yet. Orders will be saved once the backend is connected.
        </p>
      </div>

      <div className="mt-12 space-y-6 rounded-[1.5rem] bg-cream-100 p-6 md:p-8">
        <ul className="divide-y divide-cocoa-100">
          {order.items.map((it, i) => (
            <li key={i} className="flex gap-4 py-4">
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">{it.image && <Image src={it.image} alt="" fill sizes="64px" className="object-cover" />}</div>
              <div className="flex-1">
                <p className="font-semibold">{it.name}</p>
                <p className="text-sm text-cocoa-500">
                  {[it.color, sizeLabel(it.size)].filter(Boolean).join(" · ")} · Qty {it.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(it.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-cocoa-100 pt-4 text-[0.92rem]">
          <div className="flex justify-between">
            <dt className="text-cocoa-600">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sage-700">
              <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-cocoa-600">Delivery & fees</dt>
            <dd>{order.shippingFee ? formatPrice(order.shippingFee) : "Free"}</dd>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
        <div className="grid gap-6 border-t border-cocoa-100 pt-6 text-[0.9rem] sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Delivering to</p>
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-cocoa-600">{order.address}</p>
            <p className="text-cocoa-600">{order.city}</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Payment</p>
            <p className="font-semibold">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            {manual && <p className="text-cocoa-600">Reference {order.paymentReference} — we&apos;ll confirm once your payment is verified.</p>}
            {order.paymentMethod === "cod" && <p className="text-cocoa-600">Please keep {formatPrice(order.total)} ready on delivery.</p>}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink href={`/track-order?order=${order.number}`} variant="secondary">
          Track this order
        </ButtonLink>
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
      </div>
      {whatsapp && (
        <p className="mt-6 text-center text-sm text-cocoa-500">
          Questions?{" "}
          <a href={whatsappLink(whatsapp, `Hi! About my order ${order.number}`)} target="_blank" rel="noopener noreferrer" className="font-bold text-sage-700 underline">
            Message us on WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}
