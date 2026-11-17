import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ClearCart } from "@/components/checkout/clear-cart";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasOrderAccess } from "@/lib/order-access";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { sizeLabel } from "@/lib/sizes";
import { formatPrice, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Thank you for your order", robots: { index: false } };

export default async function OrderSuccess({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ placed?: string }> }) {
  const [{ number }, sp, user, settings] = await Promise.all([params, searchParams, getCurrentUser(), getSettings()]);
  const order = await db.order.findUnique({ where: { number }, include: { items: true } });
  if (!order) notFound();
  const allowed = (user && order.userId === user.id) || (await hasOrderAccess(order.number));
  if (!allowed) notFound();
  const manual = ["bank", "jazzcash", "easypaisa"].includes(order.paymentMethod);

  return (
    <div className="container-kt max-w-3xl py-14 md:py-20">
      {sp.placed === "1" && <ClearCart />}
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-sage-600" strokeWidth={1.4} />
        <p className="eyebrow eyebrow-rule mt-6 justify-center">Order placed</p>
        <h1 className="display-lg mt-3">Thank you, {order.customerName.split(" ")[0]}!</h1>
        <p className="mx-auto mt-4 max-w-lg text-cocoa-500">
          Your order <strong className="text-cocoa">{order.number}</strong> has been received. We&apos;ll call or message you on {order.phone} to confirm it before dispatch.
        </p>
      </div>

      <div className="mt-12 space-y-6 rounded-[1.75rem] bg-cream-100 p-6 md:p-8">
        <ul className="divide-y divide-cocoa-100">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-4 py-4">
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
              <dt>Discount</dt>
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
      {settings.store.whatsapp && (
        <p className="mt-6 text-center text-sm text-cocoa-500">
          Questions?{" "}
          <a href={whatsappLink(settings.store.whatsapp, `Hi! About my order ${order.number}`)} target="_blank" rel="noopener noreferrer" className="font-bold text-sage-700 underline">
            Message us on WhatsApp
          </a>
        </p>
      )}
      {!user && (
        <p className="mt-4 text-center text-sm text-cocoa-500">
          <Link href="/account/register" className="font-bold text-sage-700 underline">
            Create an account
          </Link>{" "}
          to keep track of future orders.
        </p>
      )}
    </div>
  );
}
