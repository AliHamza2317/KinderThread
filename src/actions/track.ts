"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/enums";

export type TrackResult =
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
        items: { name: string; size: string; color: string | null; quantity: number }[];
        events: { status: OrderStatus | null; message: string; createdAt: string }[];
      };
    };

const schema = z.object({ order: z.string().trim().min(4).max(20), phone: z.string().trim().min(7).max(20) });

/** Public order lookup — requires the order number AND the phone number used at checkout. */
export async function trackOrderAction(_prev: TrackResult, formData: FormData): Promise<TrackResult> {
  const limited = await rateLimit("track", 12, 10 * 60_000);
  if (!limited.ok) return { ok: false, message: "Too many lookups — please try again in a few minutes." };
  const parsed = schema.safeParse({ order: formData.get("order"), phone: formData.get("phone") });
  if (!parsed.success) return { ok: false, message: "Enter your order number and the phone number used at checkout." };
  const number = parsed.data.order.toUpperCase().replace(/\s/g, "");
  const order = await db.order.findUnique({
    where: { number },
    include: { items: true, events: { where: { isPublic: true }, orderBy: { createdAt: "asc" } } },
  });
  const phone = normalizePhone(parsed.data.phone);
  if (!order || normalizePhone(order.phone) !== phone) return { ok: false, message: "We couldn't find an order with those details. Please check and try again." };
  return {
    ok: true,
    order: {
      number: order.number,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      city: order.city,
      total: order.total,
      courier: order.courier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      items: order.items.map((i) => ({ name: i.name, size: i.size, color: i.color, quantity: i.quantity })),
      events: order.events.map((e) => ({ status: e.status, message: e.message, createdAt: e.createdAt.toISOString() })),
    },
  };
}
