"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { COUPONS, CUSTOMERS, ORDERS, RETURNS } from "@/data/admin";
import { assertStaff } from "@/lib/auth";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/demo";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/orders";
import { PAYMENT_STATUSES, RETURN_STATUSES, type OrderStatus, type PaymentStatus, type ReturnStatus } from "@/lib/types";
import { RETURN_NEXT, RETURN_STATUS_LABEL } from "@/components/admin/sales/labels";

/*
 * Frontend-only build: every action validates its input and applies the same
 * business rules the real backend will, but nothing is saved — each one ends
 * by returning the demo message.
 */

const id = z.string().min(1).max(40);
const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const findOrder = (orderId: string) => ORDERS.find((o) => o.id === orderId);

/* ------------------------------------------------------------------------- */
/*                                  orders                                   */
/* ------------------------------------------------------------------------- */

const statusSchema = z.object({
  orderId: id,
  status: z.enum(ORDER_FLOW as [OrderStatus, ...OrderStatus[]], { message: "Choose a status." }),
  note: z.string().max(500).optional(),
  isPublic: z.boolean(),
});

export async function updateOrderStatusAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = statusSchema.safeParse({ orderId: str(fd, "orderId"), status: str(fd, "status"), note: str(fd, "note") || undefined, isPublic: bool(fd.get("isPublic")) });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form.", errors: fieldErrors(parsed.error.issues) };
  const { orderId, status } = parsed.data;
  const order = findOrder(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "CANCELLED" || order.status === "RETURNED") return { ok: false, message: `This order is ${order.status.toLowerCase()} and can no longer change status.` };
  if (order.status === status) return { ok: false, message: `The order is already “${ORDER_STATUS_LABEL[status]}”.` };
  return demoResult();
}

export async function addOrderNoteAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = z
    .object({ orderId: id, message: z.string().min(2, "Write a short note.").max(500), isPublic: z.boolean() })
    .safeParse({ orderId: str(fd, "orderId"), message: str(fd, "message"), isPublic: bool(fd.get("isPublic")) });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the note." };
  if (!findOrder(parsed.data.orderId)) return { ok: false, message: "Order not found." };
  return demoResult();
}

export async function updateInternalNoteAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = z.object({ orderId: id, internalNote: z.string().max(2000) }).safeParse({ orderId: str(fd, "orderId"), internalNote: str(fd, "internalNote") });
  if (!parsed.success) return { ok: false, message: "Internal note is too long (2,000 characters max)." };
  return demoResult();
}

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Payment marked as unpaid",
  PENDING_VERIFICATION: "Payment awaiting verification",
  PAID: "Payment received",
  REFUNDED: "Payment refunded",
};

export async function updatePaymentStatusAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = z
    .object({ orderId: id, paymentStatus: z.enum(PAYMENT_STATUSES), paymentReference: z.string().max(120).optional() })
    .safeParse({ orderId: str(fd, "orderId"), paymentStatus: str(fd, "paymentStatus"), paymentReference: fd.has("paymentReference") ? str(fd, "paymentReference") : undefined });
  if (!parsed.success) return { ok: false, message: "Choose a valid payment status." };
  const { orderId, paymentStatus, paymentReference } = parsed.data;
  const order = findOrder(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.paymentStatus === paymentStatus && paymentReference === undefined) return { ok: false, message: `Payment is already “${PAYMENT_LABEL[paymentStatus].toLowerCase()}”.` };
  return demoResult();
}

const shippingSchema = z.object({
  orderId: id,
  courier: z.string().max(60),
  trackingNumber: z.string().max(80),
  trackingUrl: z.union([z.literal(""), z.url("Enter a full tracking link starting with https://").max(400)]),
  markShipped: z.boolean(),
});

export async function updateShippingAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = shippingSchema.safeParse({
    orderId: str(fd, "orderId"),
    courier: str(fd, "courier"),
    trackingNumber: str(fd, "trackingNumber"),
    trackingUrl: str(fd, "trackingUrl"),
    markShipped: bool(fd.get("markShipped")),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the tracking details.", errors: fieldErrors(parsed.error.issues) };
  const { orderId, courier, trackingNumber } = parsed.data;
  if (trackingNumber && !courier) return { ok: false, message: "Add the courier name for this tracking number." };
  const order = findOrder(orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "CANCELLED") return { ok: false, message: "This order was cancelled." };
  return demoResult();
}

export async function cancelOrderAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = z.object({ orderId: id, reason: z.string().max(300) }).safeParse({ orderId: str(fd, "orderId"), reason: str(fd, "reason") });
  if (!parsed.success) return { ok: false, message: "Reason is too long." };
  const order = findOrder(parsed.data.orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (!["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status))
    return { ok: false, message: "Only orders that haven't been delivered (and aren't already cancelled) can be cancelled." };
  return demoResult();
}

export async function markReturnedAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = z.object({ orderId: id, restock: z.boolean(), note: z.string().max(300) }).safeParse({ orderId: str(fd, "orderId"), restock: bool(fd.get("restock")), note: str(fd, "note") });
  if (!parsed.success) return { ok: false, message: "Note is too long." };
  const order = findOrder(parsed.data.orderId);
  if (!order) return { ok: false, message: "Order not found." };
  if (!["SHIPPED", "DELIVERED"].includes(order.status)) return { ok: false, message: "Only shipped or delivered orders can be marked as returned." };
  return demoResult();
}

/* ------------------------------------------------------------------------- */
/*                             returns & exchanges                           */
/* ------------------------------------------------------------------------- */

export async function updateReturnAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = z
    .object({
      id,
      status: z.union([z.literal(""), z.enum(RETURN_STATUSES)]),
      adminNote: z.string().max(1000),
      markOrderReturned: z.boolean(),
      restock: z.boolean(),
    })
    .safeParse({
      id: str(fd, "id"),
      status: str(fd, "status"),
      adminNote: str(fd, "adminNote"),
      markOrderReturned: bool(fd.get("markOrderReturned")),
      restock: bool(fd.get("restock")),
    });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  const { id: requestId, status } = parsed.data;
  const req = RETURNS.find((r) => r.id === requestId);
  if (!req) return { ok: false, message: "Request not found." };
  if (status && status !== req.status && !RETURN_NEXT[req.status].includes(status as ReturnStatus)) {
    return { ok: false, message: `A ${RETURN_STATUS_LABEL[req.status].toLowerCase()} request can't move to “${RETURN_STATUS_LABEL[status as ReturnStatus]}”.` };
  }
  return demoResult();
}

/* ------------------------------------------------------------------------- */
/*                                 customers                                 */
/* ------------------------------------------------------------------------- */

export async function updateCustomerTagsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const userId = str(fd, "userId");
  const tags = [
    ...new Set(
      str(fd, "tags")
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
        .filter(Boolean),
    ),
  ];
  if (tags.some((t) => t.length > 30) || tags.length > 20) return { ok: false, message: "Use up to 20 short tags (30 characters each)." };
  if (!CUSTOMERS.some((c) => c.id === userId)) return { ok: false, message: "Customer not found." };
  return demoResult();
}

export async function setCustomerActiveAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  if (!CUSTOMERS.some((c) => c.id === str(fd, "userId"))) return { ok: false, message: "Customer not found." };
  return demoResult();
}

/* ------------------------------------------------------------------------- */
/*                                  coupons                                  */
/* ------------------------------------------------------------------------- */

const dateField = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")]);

const couponSchema = z
  .object({
    id: z.string().max(40).optional(),
    code: z
      .string()
      .min(3, "Codes need at least 3 characters.")
      .max(32, "Codes can be up to 32 characters.")
      .regex(/^[A-Z0-9_-]+$/, "Use letters, numbers, dashes or underscores only."),
    description: z.string().max(160),
    type: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
    value: z.number().int("Use a whole number.").min(0),
    minSubtotal: z.number().int().min(0).nullable(),
    maxUses: z.number().int().min(1, "Max uses must be at least 1.").nullable(),
    startsAt: dateField,
    endsAt: dateField,
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "PERCENT" && (v.value < 1 || v.value > 100)) ctx.addIssue({ code: "custom", path: ["value"], message: "Percentage must be between 1 and 100." });
    if (v.type === "FIXED" && v.value < 1) ctx.addIssue({ code: "custom", path: ["value"], message: "Enter the discount amount in rupees." });
    if (v.startsAt && v.endsAt && v.endsAt < v.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after the start date." });
  });

const optInt = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim().replace(/,/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

export async function saveCouponAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  const type = str(fd, "type");
  const parsed = couponSchema.safeParse({
    id: str(fd, "id") || undefined,
    code: str(fd, "code").toUpperCase().replace(/\s+/g, ""),
    description: str(fd, "description"),
    type,
    value: type === "FREE_SHIPPING" ? 0 : (optInt(fd.get("value")) ?? NaN),
    minSubtotal: optInt(fd.get("minSubtotal")),
    maxUses: optInt(fd.get("maxUses")),
    startsAt: str(fd, "startsAt"),
    endsAt: str(fd, "endsAt"),
    isActive: bool(fd.get("isActive")),
  });
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  const v = parsed.data;
  const clash = COUPONS.find((c) => c.code === v.code && c.id !== v.id);
  if (clash) return { ok: false, message: "That code is already in use.", errors: { code: ["That code is already in use."] } };
  redirect("/admin/coupons?demo=1");
}

export async function deleteCouponAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  if (!COUPONS.some((c) => c.id === str(fd, "id"))) return { ok: false, message: "Coupon not found." };
  redirect("/admin/coupons?demo=1");
}

export async function toggleCouponAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await assertStaff();
  if (!COUPONS.some((c) => c.id === str(fd, "id"))) return { ok: false, message: "Coupon not found." };
  return demoResult();
}
