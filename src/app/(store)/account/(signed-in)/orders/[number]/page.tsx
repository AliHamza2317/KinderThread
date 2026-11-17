import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Truck } from "lucide-react";
import { AddressText } from "@/components/account/address-text";
import { PAYMENT_STATUS_LABEL, RETURN_STATUS_LABEL } from "@/components/account/constants";
import { OrderProgress, OrderStatusPill } from "@/components/account/order-bits";
import { ReturnRequestForm } from "@/components/account/return-form";
import { returnEligibility } from "@/components/account/return-eligibility";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { sizeLabel } from "@/lib/sizes";
import { formatDate, formatPrice, whatsappLink } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${decodeURIComponent(number)}` };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ number: string }> }) {
  const { number: raw } = await params;
  const number = decodeURIComponent(raw).slice(0, 40);
  const user = await requireUser(`/account/orders/${number}`);
  const order = await db.order.findFirst({
    where: { number, userId: user.id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      returnRequests: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const [eligibility, settings] = await Promise.all([returnEligibility(order.id, order.status, order.updatedAt), getSettings()]);
  const publicEvents = order.events.filter((e) => e.isPublic);
  const trackingUrl = order.trackingUrl && /^https?:\/\//i.test(order.trackingUrl) ? order.trackingUrl : null;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const paymentStatus =
    order.paymentStatus === "UNPAID" && order.paymentMethod === "cod" ? "Pay on delivery" : PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link href="/account/orders" className="text-sm font-semibold text-cocoa-500 hover:text-cocoa">
          ← All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="display-md">Order {order.number}</h1>
          <OrderStatusPill status={order.status} />
        </div>
        <p className="mt-2 text-cocoa-500">
          Placed on {formatDate(order.createdAt, { dateStyle: "long" })} · {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </header>

      <section className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-5 md:p-7" aria-label="Order progress">
        <OrderProgress status={order.status} events={order.events} />
        {(order.courier || order.trackingNumber) && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-sage-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 shrink-0 text-sage-700" />
              <span>
                {order.courier && <strong className="text-cocoa">{order.courier}</strong>}
                {order.courier && order.trackingNumber && " · "}
                {order.trackingNumber && (
                  <>
                    Tracking no. <span className="font-mono font-semibold text-cocoa">{order.trackingNumber}</span>
                  </>
                )}
              </span>
            </p>
            {trackingUrl && (
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-sage-700 link-underline">
                Track with courier <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="items-heading">
            <h2 id="items-heading" className="font-display text-2xl">
              Items
            </h2>
            <ul className="mt-4 divide-y divide-cocoa-100 rounded-[1.5rem] border border-cocoa-100 bg-cream-50 px-5">
              {order.items.map((it) => (
                <li key={it.id} className="flex gap-4 py-4">
                  <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200 sm:w-20">
                    {it.image && <Image src={it.image} alt="" fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="font-semibold leading-snug">{it.name}</p>
                    <p className="mt-0.5 text-[0.82rem] text-cocoa-500">{[it.color, sizeLabel(it.size)].filter(Boolean).join(" · ")}</p>
                    <p className="mt-0.5 text-[0.78rem] text-cocoa-400">SKU {it.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold">{formatPrice(it.lineTotal)}</p>
                    <p className="text-cocoa-500">
                      {it.quantity} × {formatPrice(it.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {publicEvents.length > 0 && (
            <section aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="font-display text-2xl">
                Updates
              </h2>
              <ol className="mt-4 flex flex-col">
                {[...publicEvents].reverse().map((e, i) => (
                  <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < publicEvents.length - 1 && <span className="absolute top-3 left-[5px] h-full w-px bg-cocoa-100" aria-hidden />}
                    <span className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ${i === 0 ? "bg-coral-500 ring-4 ring-coral-100" : "bg-cocoa-200"}`} />
                    <div>
                      <p className="font-semibold">{e.message}</p>
                      <p className="text-[0.82rem] text-cocoa-500">{formatDate(e.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="returns-heading" className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-5 md:p-6">
            <h2 id="returns-heading" className="font-sans text-base font-bold tracking-normal">
              Returns & exchanges
            </h2>
            {order.returnRequests.length > 0 && (
              <ul className="mt-4 flex flex-col gap-3">
                {order.returnRequests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {r.type === "RETURN" ? "Return" : "Exchange"} · {r.reason}
                      </p>
                      <p className="text-[0.78rem] text-cocoa-500">Requested {formatDate(r.createdAt)}</p>
                    </div>
                    <Badge tone={r.status === "REJECTED" ? "danger" : r.status === "COMPLETED" ? "success" : "info"}>{RETURN_STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              {eligibility.eligible ? (
                <ReturnRequestForm orderNumber={order.number} deadline={eligibility.deadline ? formatDate(eligibility.deadline, { day: "numeric", month: "long" }) : undefined} />
              ) : (
                <p className="text-sm text-cocoa-500">
                  {eligibility.reason}{" "}
                  <Link href="/pages/returns" className="font-semibold text-sage-700 underline underline-offset-2">
                    Read our returns policy
                  </Link>
                  .
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-6" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="font-sans text-base font-bold tracking-normal">
              Summary
            </h2>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-cocoa-500">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sage-700">
                  <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-cocoa-500">Delivery</dt>
                <dd>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-cocoa-100 pt-3 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-6" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="font-sans text-base font-bold tracking-normal">
              Payment
            </h2>
            <p className="mt-3 text-sm">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            <p className="mt-1 text-sm text-cocoa-500">{paymentStatus}</p>
            {order.paymentReference && <p className="mt-1 text-[0.8rem] text-cocoa-400">Reference: {order.paymentReference}</p>}
          </section>

          <section className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-6" aria-labelledby="ship-heading">
            <h2 id="ship-heading" className="font-sans text-base font-bold tracking-normal">
              Delivery address
            </h2>
            <div className="mt-3">
              <AddressText a={{ fullName: order.customerName, phone: order.phone, line1: order.address, city: order.city, postalCode: order.postalCode }} />
            </div>
            {order.notes && <p className="mt-3 text-[0.82rem] text-cocoa-500">Note: {order.notes}</p>}
          </section>

          {settings.store.whatsapp && (
            <a
              href={whatsappLink(settings.store.whatsapp, `Hi! I have a question about my order ${order.number}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[1.5rem] border border-dashed border-cocoa-200 p-5 text-sm text-cocoa-600 transition hover:border-cocoa-400"
            >
              Questions about this order? <span className="font-bold text-sage-700">Message us on WhatsApp</span>
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
