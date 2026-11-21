import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, OrderStatusBadge, PageHeader } from "@/components/admin/ui";
import { RETURN_STATUS_LABEL, RETURN_STATUS_TONE, RETURN_TYPE_LABEL } from "@/components/admin/sales/labels";
import { ReturnUpdateForm } from "@/components/admin/sales/return-form";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { ORDERS, RETURNS } from "@/data/admin";
import { sizeLabel } from "@/lib/sizes";
import { formatDate, formatPrice, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Return request" };

export default async function ReturnDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const req = RETURNS.find((x) => x.id === id);
  const order = req ? ORDERS.find((o) => o.id === req.orderId) : undefined;
  if (!req || !order) notFound();
  const r = { ...req, order };
  const deliveredAt = r.order.events
    .filter((e) => e.status === "DELIVERED")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/returns", label: "Returns & exchanges" }}
        title={`${RETURN_TYPE_LABEL[r.type]} request`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Order{" "}
            <Link href={`/admin/orders/${r.order.id}`} className="font-semibold text-cocoa hover:underline">
              {r.order.number}
            </Link>{" "}
            · requested {formatDate(r.createdAt, { dateStyle: "medium", timeStyle: "short" })}
            <Badge tone={RETURN_STATUS_TONE[r.status]}>{RETURN_STATUS_LABEL[r.status]}</Badge>
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Customer's request">
            <p className="font-semibold">{r.reason}</p>
            {r.details ? <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-cocoa-600">{r.details}</p> : <p className="mt-2 text-sm text-cocoa-400">No extra details.</p>}
          </Card>
          <Card title="Order items">
            <ul className="divide-y divide-cocoa-100">
              {r.order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg bg-cream-100">{i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="text-[0.78rem] text-cocoa-500">
                      {[i.color, sizeLabel(i.size)].filter(Boolean).join(" · ")} · {i.sku}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">
                    {i.quantity} × {formatPrice(i.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card title="Update request">
            <ReturnUpdateForm id={r.id} status={r.status} type={r.type} adminNote={r.adminNote} orderReturnable={r.order.status === "SHIPPED" || r.order.status === "DELIVERED"} />
          </Card>
          <Card title="Order">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-cocoa-500">Status</dt>
                <dd>
                  <OrderStatusBadge status={r.order.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cocoa-500">Total</dt>
                <dd className="font-semibold">{formatPrice(r.order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cocoa-500">Delivered</dt>
                <dd>{deliveredAt ? formatDate(deliveredAt) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-cocoa-500">Customer</dt>
                <dd className="text-right">
                  {r.order.customerName}
                  <br />
                  <a className="text-sage-700 hover:underline" href={whatsappLink(r.order.phone, `Hi ${r.order.customerName.split(" ")[0]}, this is Kinder Thread about your ${r.type === "EXCHANGE" ? "exchange" : "return"} request for order ${r.order.number}.`)} target="_blank" rel="noopener noreferrer">
                    WhatsApp {r.order.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
