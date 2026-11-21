"use client";

import { useState } from "react";
import { Check, ExternalLink, PackageSearch } from "lucide-react";
import { ORDERS } from "@/data/admin";
import type { OrderStatus } from "@/lib/types";
import { normalizePhone } from "@/lib/utils";
import { useDemoOrders } from "@/stores/demo-orders";

type TrackResult =
  | null
  | { ok: false; message: string }
  | {
      ok: true;
      order: {
        number: string;
        status: OrderStatus;
        createdAt: string;
        city: string;
        total: number;
        courier: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        items: {
          name: string;
          size: string;
          color: string | null;
          quantity: number;
        }[];
        events: {
          status: OrderStatus | null;
          message: string;
          createdAt: string;
        }[];
      };
    };
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { sizeLabel } from "@/lib/sizes";

const FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;
const LABEL: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export function TrackOrderClient({ initialOrder }: { initialOrder: string }) {
  const [state, setState] = useState<TrackResult>(null);
  const [orderNo, setOrderNo] = useState(initialOrder);
  const [phone, setPhone] = useState("");
  const demoOrders = useDemoOrders((s) => s.orders);
  const pending = false;

  /**
   * Frontend-only build: looks up orders placed in this browser (demo checkout)
   * and the dummy orders. Requires the order number AND the phone used at checkout.
   */
  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const number = orderNo.trim().toUpperCase().replace(/\s/g, "");
    const ph = normalizePhone(phone.trim());
    if (number.length < 4 || ph.length < 7)
      return setState({
        ok: false,
        message:
          "Enter your order number and the phone number used at checkout.",
      });
    const local = demoOrders.find(
      (o) => o.number === number && normalizePhone(o.phone) === ph,
    );
    if (local)
      return setState({
        ok: true,
        order: {
          number: local.number,
          status: local.status,
          createdAt: local.createdAt,
          city: local.city,
          total: local.total,
          courier: null,
          trackingNumber: null,
          trackingUrl: null,
          items: local.items.map((i) => ({
            name: i.name,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          events: [
            {
              status: "PENDING",
              message: "Order placed",
              createdAt: local.createdAt,
            },
          ],
        },
      });
    const o = ORDERS.find(
      (x) => x.number === number && normalizePhone(x.phone) === ph,
    );
    if (!o)
      return setState({
        ok: false,
        message:
          "We couldn't find an order with those details. Please check and try again.",
      });
    setState({
      ok: true,
      order: {
        number: o.number,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        city: o.city,
        total: o.total,
        courier: o.courier,
        trackingNumber: o.trackingNumber,
        trackingUrl: o.trackingUrl,
        items: o.items.map((i) => ({
          name: i.name,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        events: o.events
          .filter((e) => e.isPublic)
          .map((e) => ({
            status: e.status,
            message: e.message,
            createdAt: e.createdAt.toISOString(),
          })),
      },
    });
  };
  const order = state?.ok ? state.order : null;
  const step = order ? FLOW.indexOf(order.status as (typeof FLOW)[number]) : -1;
  return (
    <>
      <PageHero
        eyebrow="Orders"
        title="Track your *order*"
        description="Enter your order number (e.g. KT2611-12345) and the mobile number you used at checkout."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Track your order" },
        ]}
        size="sm"
      />
      <div className="container-kt max-w-3xl py-10 md:py-14">
        <form
          onSubmit={lookup}
          className="grid gap-4 rounded-[2rem] border border-cocoa/10 bg-cream-50 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end md:p-8"
        >
          <PackageSearch
            className="h-6 w-6 text-cocoa-400 sm:col-span-3"
            strokeWidth={1.5}
            aria-hidden
          />
          <Field label="Order number" htmlFor="order">
            <Input
              id="order"
              name="order"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              required
              autoCapitalize="characters"
            />
          </Field>
          <Field label="Mobile number" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="03XX XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" loading={pending} className="h-12">
            Track
          </Button>
        </form>
        {state && !state.ok && (
          <p
            className="mt-6 rounded-2xl bg-coral-100 px-4 py-3 text-sm font-medium text-coral-800"
            role="alert"
          >
            {state.message}
          </p>
        )}

        {order && (
          <section
            className="mt-6 space-y-8 rounded-[2rem] bg-cream-100 p-6 md:p-8"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">Order {order.number}</h2>
              <p className="text-sm text-cocoa-500">
                Placed {formatDate(order.createdAt)} ·{" "}
                {formatPrice(order.total)}
              </p>
            </div>
            {order.status === "CANCELLED" || order.status === "RETURNED" ? (
              <p className="rounded-[1.5rem] bg-cocoa-50 p-4 font-semibold">
                This order was {LABEL[order.status].toLowerCase()}.
              </p>
            ) : (
              <ol
                className="grid grid-cols-5 gap-2"
                aria-label="Order progress"
              >
                {FLOW.map((s, i) => (
                  <li
                    key={s}
                    className="flex flex-col items-center text-center"
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full text-sm font-bold",
                        i <= step
                          ? "bg-sage-600 text-cream-50"
                          : "bg-cocoa-100 text-cocoa-400",
                      )}
                    >
                      {i < step || (i === step && s === "DELIVERED") ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-2 text-[0.72rem] font-semibold sm:text-[0.8rem]",
                        i <= step ? "text-cocoa" : "text-cocoa-400",
                      )}
                    >
                      {LABEL[s]}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {order.trackingNumber && (
              <div className="rounded-[1.5rem] bg-cream-50 p-4 text-sm">
                <p>
                  <strong>{order.courier || "Courier"}</strong> · Tracking
                  number{" "}
                  <strong className="select-all">{order.trackingNumber}</strong>
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-sage-700 underline"
                  >
                    Track with courier <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
            <div>
              <p className="eyebrow mb-3">Updates</p>
              <ol className="space-y-3 border-l-2 border-cocoa-100 pl-5">
                {[...order.events].reverse().map((e, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full bg-sage-500 ring-4 ring-cream-100" />
                    <p className="font-semibold">{e.message}</p>
                    <p className="text-cocoa-500">
                      {formatDate(e.createdAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="eyebrow mb-3">Items · delivering to {order.city}</p>
              <ul className="space-y-1 text-sm text-cocoa-600">
                {order.items.map((it, i) => (
                  <li key={i}>
                    {it.quantity} × {it.name} (
                    {[it.color, sizeLabel(it.size)].filter(Boolean).join(", ")})
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
