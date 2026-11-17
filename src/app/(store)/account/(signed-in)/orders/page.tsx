import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { OrderStatusPill } from "@/components/account/order-bits";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, number: true, createdAt: true, status: true, total: true, items: { select: { quantity: true } } },
  });

  return (
    <div>
      <Eyebrow>Orders</Eyebrow>
      <h1 className="display-md mt-3">Your orders</h1>
      <p className="mt-2 text-cocoa-500">Track deliveries, view details and request returns.</p>

      {orders.length === 0 ? (
        <div className="stitch-border mt-8 flex flex-col items-center rounded-[1.5rem] px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-cream-200">
            <ShoppingBag className="h-6 w-6 text-cocoa-400" />
          </span>
          <p className="mt-4 font-display text-xl">No orders yet</p>
          <p className="mt-1 max-w-sm text-sm text-cocoa-500">
            Placed an order as a guest? You can follow it on the{" "}
            <Link href="/track-order" className="font-semibold text-sage-700 underline underline-offset-2">
              track order
            </Link>{" "}
            page.
          </p>
          <ButtonLink href="/shop" className="mt-5">
            Start shopping
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-cocoa-100 bg-cream-50">
          <div className="hidden grid-cols-[1.3fr_1fr_0.7fr_1fr_0.9fr_24px] gap-4 border-b border-cocoa-100 px-6 py-3 text-[0.7rem] font-bold tracking-[0.16em] text-cocoa-400 uppercase md:grid">
            <span>Order</span>
            <span>Date</span>
            <span>Items</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          <ul className="divide-y divide-cocoa-100">
            {orders.map((o) => {
              const count = o.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <li key={o.id}>
                  <Link
                    href={`/account/orders/${o.number}`}
                    className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-cream-100 md:grid-cols-[1.3fr_1fr_0.7fr_1fr_0.9fr_24px] md:px-6"
                  >
                    <span className="font-semibold">{o.number}</span>
                    <span className="text-right text-sm font-bold md:order-5">{formatPrice(o.total)}</span>
                    <span className="text-sm text-cocoa-500 md:order-2">{formatDate(o.createdAt)}</span>
                    <span className="text-right md:order-4 md:text-left">
                      <OrderStatusPill status={o.status} />
                    </span>
                    <span className="hidden text-sm text-cocoa-500 md:order-3 md:block">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                    <ArrowRight className="hidden h-4 w-4 text-cocoa-300 transition group-hover:translate-x-0.5 group-hover:text-cocoa md:order-6 md:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
