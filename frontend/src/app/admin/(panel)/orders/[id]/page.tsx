import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { Card, OrderStatusBadge, PageHeader } from "@/components/admin/ui";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, RETURN_STATUS_LABEL, RETURN_STATUS_TONE, RETURN_TYPE_LABEL } from "@/components/admin/sales/labels";
import {
  CancelForm,
  InternalNoteForm,
  NoteForm,
  PackingSlipButton,
  PaymentActions,
  ReturnedForm,
  ShippingForm,
  StatusForm,
} from "@/components/admin/sales/order-forms";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { CUSTOMERS, ORDERS, RETURNS } from "@/data/admin";
import { PRODUCTS } from "@/data/catalog";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/orders";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { sizeLabel } from "@/lib/sizes";
import { cn, formatDate, formatPrice, whatsappLink } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const o = ORDERS.find((x) => x.id === id);
  return { title: o ? `Order ${o.number}` : "Order" };
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const closed = order.status === "CANCELLED" || order.status === "RETURNED";
  const units = order.items.reduce((n, i) => n + i.quantity, 0);
  const manual = ["bank", "jazzcash", "easypaisa"].includes(order.paymentMethod);
  const flowIdx = ORDER_FLOW.indexOf(order.status);
  const canCancel = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status);
  const canReturn = order.status === "SHIPPED" || order.status === "DELIVERED";
  const payLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const waText = `Assalam o Alaikum ${order.customerName.split(" ")[0]}! This is Kinder Thread regarding your order ${order.number}.`;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "All orders" }}
        title={`Order ${order.number}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Placed {formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}
            <OrderStatusBadge status={order.status} />
            <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</Badge>
          </span>
        }
        actions={
          <PackingSlipButton
            order={{
              number: order.number,
              date: formatDate(order.createdAt, { dateStyle: "medium" }),
              customerName: order.customerName,
              phone: order.phone,
              email: order.email,
              address: order.address,
              city: order.city,
              postalCode: order.postalCode,
              notes: order.notes,
              paymentMethod: payLabel,
              paymentStatus: PAYMENT_STATUS_LABEL[order.paymentStatus],
              total: formatPrice(order.total),
              codDue: order.paymentMethod === "cod" && order.paymentStatus !== "PAID" ? formatPrice(order.total) : null,
              items: order.items.map((i) => ({ name: i.name, sku: i.sku, size: sizeLabel(i.size), color: i.color, quantity: i.quantity })),
            }}
          />
        }
      />

      {/* progress */}
      {!closed ? (
        <ol className="mb-8 grid grid-cols-5 gap-2" aria-label="Order progress">
          {ORDER_FLOW.map((s, i) => (
            <li key={s} className="flex flex-col gap-2">
              <span className={cn("h-1.5 rounded-full", i <= flowIdx ? "bg-sage-500" : "bg-cocoa-100")} />
              <span className={cn("text-[0.72rem] font-semibold sm:text-[0.8rem]", i <= flowIdx ? "text-cocoa" : "text-cocoa-400")}>{ORDER_STATUS_LABEL[s]}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-8 rounded-2xl bg-coral-50 px-5 py-4 text-sm text-coral-800">
          This order is <strong>{order.status.toLowerCase()}</strong>. Its status can no longer be changed{order.status === "CANCELLED" ? " — items were returned to stock" : ""}.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title={`Items · ${units} unit${units === 1 ? "" : "s"}`}>
            <ul className="divide-y divide-cocoa-100">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                    {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {i.product ? (
                        <Link href={`/admin/products/${i.product.id}`} className="hover:underline">
                          {i.name}
                        </Link>
                      ) : (
                        i.name
                      )}
                    </p>
                    <p className="text-[0.8rem] text-cocoa-500">{[i.color, sizeLabel(i.size)].filter(Boolean).join(" · ")}</p>
                    <p className="mt-0.5 font-mono text-[0.72rem] text-cocoa-400">{i.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-cocoa-500 tabular-nums">
                      {formatPrice(i.unitPrice)} × {i.quantity}
                    </p>
                    <p className="font-semibold tabular-nums">{formatPrice(i.lineTotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-cocoa-100 pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatPrice(order.discount)}`} />}
              <Row label="Delivery" value={order.shippingFee ? formatPrice(order.shippingFee) : "Free"} />
              <Row label="Total" value={formatPrice(order.total)} strong />
            </dl>
          </Card>

          {order.returnRequests.length > 0 && (
            <Card title="Return & exchange requests">
              <ul className="divide-y divide-cocoa-100">
                {order.returnRequests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="flex items-center gap-2 font-semibold">
                        <RotateCcw className="h-4 w-4 text-cocoa-400" />
                        {RETURN_TYPE_LABEL[r.type]} · {r.reason}
                      </p>
                      <p className="text-[0.8rem] text-cocoa-500">Requested {formatDate(r.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={RETURN_STATUS_TONE[r.status]}>{RETURN_STATUS_LABEL[r.status]}</Badge>
                      <Link href={`/admin/returns/${r.id}`} className="text-sm font-semibold text-sage-700 hover:underline">
                        Manage
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Timeline" description="Public updates appear on the customer's order page and tracking page.">
            {!closed && (
              <div className="mb-6 border-b border-cocoa-100 pb-6">
                <NoteForm orderId={order.id} />
              </div>
            )}
            <ol className="relative flex flex-col gap-5 border-l border-cocoa-100 pl-6">
              {order.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className={cn("absolute top-1.5 -left-[29px] h-2.5 w-2.5 rounded-full ring-4 ring-cream", e.isPublic ? "bg-sage-500" : "bg-cocoa-300")} />
                  <p className="text-sm font-semibold">{e.message}</p>
                  <p className="mt-0.5 text-[0.75rem] text-cocoa-500">
                    {formatDate(e.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                    {e.actor && ` · ${e.actor}`} · {e.isPublic ? "visible to customer" : "internal"}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {!closed &&
            (order.status === "DELIVERED" ? (
              <Card title="Order status" description="Delivered — this order has completed its journey.">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-sage-700 marker:content-none hover:underline">Correct the status…</summary>
                  <div className="mt-4">
                    <StatusForm orderId={order.id} current={order.status} />
                  </div>
                </details>
              </Card>
            ) : (
              <Card title="Order status">
                <StatusForm orderId={order.id} current={order.status} />
              </Card>
            ))}

          <Card title="Customer">
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-sm text-cocoa-500">
              {order.user ? (
                <Link href={`/admin/customers/${order.user.id}`} className="text-sage-700 hover:underline">
                  Account · {order.user._count.orders} order{order.user._count.orders === 1 ? "" : "s"}
                </Link>
              ) : (
                "Guest checkout"
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={whatsappLink(order.phone, waText)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1.5 text-[0.8rem] font-semibold text-sage-800 hover:bg-sage-200">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-cocoa-50 px-3 py-1.5 text-[0.8rem] font-semibold hover:bg-cocoa-100">
                <Phone className="h-3.5 w-3.5" /> {order.phone}
              </a>
              <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Your Kinder Thread order ${order.number}`)}`} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-cocoa-50 px-3 py-1.5 text-[0.8rem] font-semibold hover:bg-cocoa-100">
                <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{order.email}</span>
              </a>
            </div>
            <div className="mt-5 border-t border-cocoa-100 pt-4 text-sm">
              <p className="eyebrow mb-2">Delivery address</p>
              <p className="leading-relaxed text-cocoa-600">
                {order.address}
                <br />
                {order.city}
                {order.postalCode && ` ${order.postalCode}`}
              </p>
              {order.notes && (
                <>
                  <p className="eyebrow mt-4 mb-2">Customer note</p>
                  <p className="rounded-xl bg-sun-50 px-3 py-2 text-cocoa-600">{order.notes}</p>
                </>
              )}
            </div>
          </Card>

          <Card title="Payment" description={payLabel}>
            {order.paymentReference && (
              <p className="mb-4 text-sm">
                Reference: <span className="font-mono font-semibold">{order.paymentReference}</span>
              </p>
            )}
            <PaymentActions orderId={order.id} status={order.paymentStatus} reference={order.paymentReference} manual={manual} />
          </Card>

          <Card title="Delivery & tracking">
            {closed && !order.trackingNumber ? (
              <p className="text-sm text-cocoa-500">No tracking was added.</p>
            ) : (
              <ShippingForm
                orderId={order.id}
                courier={order.courier}
                trackingNumber={order.trackingNumber}
                trackingUrl={order.trackingUrl}
                canMarkShipped={flowIdx > -1 && flowIdx < ORDER_FLOW.indexOf("SHIPPED")}
              />
            )}
          </Card>

          <Card title="Internal note" description="Only visible to staff.">
            <InternalNoteForm orderId={order.id} value={order.internalNote} />
          </Card>

          {(canCancel || canReturn) && (
            <Card title="Cancel or return" className="border-coral-200">
              <div className="flex flex-col gap-6">
                {canCancel && <CancelForm orderId={order.id} number={order.number} />}
                {canReturn && (
                  <div className={cn(canCancel && "border-t border-cocoa-100 pt-6")}>
                    <ReturnedForm orderId={order.id} number={order.number} />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", strong && "border-t border-cocoa-100 pt-2 text-base font-bold")}>
      <dt className={strong ? "" : "text-cocoa-500"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function getOrder(id: string) {
  const o = ORDERS.find((x) => x.id === id);
  if (!o) return null;
  const customer = o.userId ? CUSTOMERS.find((c) => c.id === o.userId) : undefined;
  return {
    ...o,
    items: o.items.map((i) => {
      const p = i.productId ? PRODUCTS.find((x) => x.id === i.productId) : undefined;
      return { ...i, product: p ? { id: p.id, slug: p.slug } : null };
    }),
    events: [...o.events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    returnRequests: RETURNS.filter((r) => r.orderId === o.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    user: customer
      ? { id: customer.id, name: customer.name, email: customer.email, _count: { orders: ORDERS.filter((x) => x.userId === customer.id).length } }
      : null,
  };
}
