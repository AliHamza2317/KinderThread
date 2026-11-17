"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertStaff } from "@/lib/auth";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { ORDER_FLOW, ORDER_STATUS_LABEL, restockOrder } from "@/lib/orders";
import { Prisma } from "@/generated/prisma/client";
import { OrderStatus, PaymentStatus, ReturnStatus } from "@/generated/prisma/enums";
import { RETURN_NEXT, RETURN_STATUS_LABEL } from "@/components/admin/sales/labels";

/* ------------------------------------------------------------------------- */
/*                                 helpers                                   */
/* ------------------------------------------------------------------------- */

const id = z.string().min(1).max(40);
const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function fail(e: unknown, fallback = "Something went wrong. Please try again."): ActionResult {
  if (e instanceof Error && e.message === "Not authorised") return { ok: false, message: "Your session has expired — please sign in again." };
  if (e instanceof Error && (e as Error & { expose?: boolean }).expose) return { ok: false, message: e.message };
  console.error(e);
  return { ok: false, message: fallback };
}

class UserError extends Error {
  expose = true;
}

function touchOrder(orderId: string) {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account", "layout");
}

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
  try {
    const user = await assertStaff();
    const parsed = statusSchema.safeParse({ orderId: str(fd, "orderId"), status: str(fd, "status"), note: str(fd, "note") || undefined, isPublic: bool(fd.get("isPublic")) });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form.", errors: fieldErrors(parsed.error.issues) };
    const { orderId, status, note, isPublic } = parsed.data;
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!order) throw new UserError("Order not found.");
      if (order.status === "CANCELLED" || order.status === "RETURNED") throw new UserError(`This order is ${order.status.toLowerCase()} and can no longer change status.`);
      if (order.status === status) throw new UserError(`The order is already “${ORDER_STATUS_LABEL[status]}”.`);
      await tx.order.update({ where: { id: orderId }, data: { status } });
      await tx.orderEvent.create({
        data: { orderId, status, message: note || ORDER_STATUS_LABEL[status], isPublic, actor: user.name },
      });
    });
    touchOrder(orderId);
    return { ok: true, message: `Status updated to “${ORDER_STATUS_LABEL[status]}”.` };
  } catch (e) {
    return fail(e);
  }
}

export async function addOrderNoteAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await assertStaff();
    const parsed = z
      .object({ orderId: id, message: z.string().min(2, "Write a short note.").max(500), isPublic: z.boolean() })
      .safeParse({ orderId: str(fd, "orderId"), message: str(fd, "message"), isPublic: bool(fd.get("isPublic")) });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the note." };
    const { orderId, message, isPublic } = parsed.data;
    const exists = await db.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!exists) return { ok: false, message: "Order not found." };
    await db.orderEvent.create({ data: { orderId, message, isPublic, actor: user.name } });
    touchOrder(orderId);
    return { ok: true, message: isPublic ? "Update added — the customer can see it." : "Internal note added." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateInternalNoteAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
    const parsed = z.object({ orderId: id, internalNote: z.string().max(2000) }).safeParse({ orderId: str(fd, "orderId"), internalNote: str(fd, "internalNote") });
    if (!parsed.success) return { ok: false, message: "Internal note is too long (2,000 characters max)." };
    await db.order.update({ where: { id: parsed.data.orderId }, data: { internalNote: parsed.data.internalNote || null } });
    touchOrder(parsed.data.orderId);
    return { ok: true, message: "Internal note saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function updatePaymentStatusAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await assertStaff();
    const parsed = z
      .object({ orderId: id, paymentStatus: z.enum(Object.keys(PaymentStatus) as [PaymentStatus, ...PaymentStatus[]]), paymentReference: z.string().max(120).optional() })
      .safeParse({ orderId: str(fd, "orderId"), paymentStatus: str(fd, "paymentStatus"), paymentReference: fd.has("paymentReference") ? str(fd, "paymentReference") : undefined });
    if (!parsed.success) return { ok: false, message: "Choose a valid payment status." };
    const { orderId, paymentStatus, paymentReference } = parsed.data;
    const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
    if (!order) return { ok: false, message: "Order not found." };
    const labels: Record<PaymentStatus, string> = {
      UNPAID: "Payment marked as unpaid",
      PENDING_VERIFICATION: "Payment awaiting verification",
      PAID: "Payment received",
      REFUNDED: "Payment refunded",
    };
    if (order.paymentStatus === paymentStatus) {
      if (paymentReference === undefined) return { ok: false, message: `Payment is already “${labels[paymentStatus].toLowerCase()}”.` };
      await db.order.update({ where: { id: orderId }, data: { paymentReference: paymentReference || null } });
      touchOrder(orderId);
      return { ok: true, message: "Transaction reference saved." };
    }
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: { paymentStatus, ...(paymentReference !== undefined ? { paymentReference: paymentReference || null } : {}) },
      }),
      db.orderEvent.create({
        data: { orderId, message: labels[paymentStatus], isPublic: paymentStatus === "PAID" || paymentStatus === "REFUNDED", actor: user.name },
      }),
    ]);
    touchOrder(orderId);
    return { ok: true, message: `${labels[paymentStatus]}.` };
  } catch (e) {
    return fail(e);
  }
}

const shippingSchema = z.object({
  orderId: id,
  courier: z.string().max(60),
  trackingNumber: z.string().max(80),
  trackingUrl: z.union([z.literal(""), z.url("Enter a full tracking link starting with https://").max(400)]),
  markShipped: z.boolean(),
});

export async function updateShippingAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await assertStaff();
    const parsed = shippingSchema.safeParse({
      orderId: str(fd, "orderId"),
      courier: str(fd, "courier"),
      trackingNumber: str(fd, "trackingNumber"),
      trackingUrl: str(fd, "trackingUrl"),
      markShipped: bool(fd.get("markShipped")),
    });
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the tracking details.", errors: fieldErrors(parsed.error.issues) };
    const { orderId, courier, trackingNumber, trackingUrl, markShipped } = parsed.data;
    if (trackingNumber && !courier) return { ok: false, message: "Add the courier name for this tracking number." };

    let shipped = false;
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true, trackingNumber: true, courier: true } });
      if (!order) throw new UserError("Order not found.");
      if (order.status === "CANCELLED") throw new UserError("This order was cancelled.");
      const changed = trackingNumber && (trackingNumber !== order.trackingNumber || courier !== order.courier);
      const canShip = markShipped && ORDER_FLOW.indexOf(order.status) > -1 && ORDER_FLOW.indexOf(order.status) < ORDER_FLOW.indexOf("SHIPPED");
      await tx.order.update({
        where: { id: orderId },
        data: { courier: courier || null, trackingNumber: trackingNumber || null, trackingUrl: trackingUrl || null, ...(canShip ? { status: "SHIPPED" } : {}) },
      });
      if (changed || canShip) {
        await tx.orderEvent.create({
          data: {
            orderId,
            status: canShip ? "SHIPPED" : null,
            message: trackingNumber ? `Shipped with ${courier} — tracking number ${trackingNumber}` : "Order shipped",
            isPublic: true,
            actor: user.name,
          },
        });
      }
      shipped = !!canShip;
    });
    touchOrder(orderId);
    return { ok: true, message: shipped ? "Tracking saved and order marked as shipped." : "Delivery details saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelOrderAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await assertStaff();
    const parsed = z.object({ orderId: id, reason: z.string().max(300) }).safeParse({ orderId: str(fd, "orderId"), reason: str(fd, "reason") });
    if (!parsed.success) return { ok: false, message: "Reason is too long." };
    const { orderId, reason } = parsed.data;
    await db.$transaction(async (tx) => {
      // Guarded update: only one request can move an open order to CANCELLED, so stock is restored exactly once.
      const res = await tx.order.updateMany({
        where: { id: orderId, status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] } },
        data: { status: "CANCELLED" },
      });
      if (res.count !== 1) throw new UserError("Only orders that haven't been delivered (and aren't already cancelled) can be cancelled.");
      await restockOrder(tx, orderId);
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { couponCode: true } });
      if (order?.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
      }
      await tx.orderEvent.create({
        data: { orderId, status: "CANCELLED", message: reason ? `Order cancelled — ${reason}` : "Order cancelled", isPublic: true, actor: user.name },
      });
    });
    touchOrder(orderId);
    return { ok: true, message: "Order cancelled and items returned to stock." };
  } catch (e) {
    return fail(e);
  }
}

export async function markReturnedAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await assertStaff();
    const parsed = z.object({ orderId: id, restock: z.boolean(), note: z.string().max(300) }).safeParse({ orderId: str(fd, "orderId"), restock: bool(fd.get("restock")), note: str(fd, "note") });
    if (!parsed.success) return { ok: false, message: "Note is too long." };
    const { orderId, restock, note } = parsed.data;
    await db.$transaction(async (tx) => {
      const res = await tx.order.updateMany({ where: { id: orderId, status: { in: ["SHIPPED", "DELIVERED"] } }, data: { status: "RETURNED" } });
      if (res.count !== 1) throw new UserError("Only shipped or delivered orders can be marked as returned.");
      if (restock) await restockOrder(tx, orderId);
      await tx.orderEvent.create({
        data: { orderId, status: "RETURNED", message: note ? `Order returned — ${note}` : "Order returned", isPublic: true, actor: user.name },
      });
      if (restock) await tx.orderEvent.create({ data: { orderId, message: "Returned items added back to stock", isPublic: false, actor: user.name } });
    });
    touchOrder(orderId);
    return { ok: true, message: restock ? "Order marked as returned and items restocked." : "Order marked as returned." };
  } catch (e) {
    return fail(e);
  }
}

/* ------------------------------------------------------------------------- */
/*                             returns & exchanges                           */
/* ------------------------------------------------------------------------- */

export async function updateReturnAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    const user = await assertStaff();
    const parsed = z
      .object({
        id,
        status: z.union([z.literal(""), z.enum(Object.keys(ReturnStatus) as [ReturnStatus, ...ReturnStatus[]])]),
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
    const { id: requestId, status, adminNote, markOrderReturned, restock } = parsed.data;

    let orderId = "";
    let msg = "Notes saved.";
    await db.$transaction(async (tx) => {
      const req = await tx.returnRequest.findUnique({ where: { id: requestId }, include: { order: { select: { id: true, status: true } } } });
      if (!req) throw new UserError("Request not found.");
      orderId = req.orderId;
      const next = status || req.status;
      if (status && status !== req.status && !RETURN_NEXT[req.status].includes(status)) {
        throw new UserError(`A ${RETURN_STATUS_LABEL[req.status].toLowerCase()} request can't move to “${RETURN_STATUS_LABEL[status]}”.`);
      }
      await tx.returnRequest.update({ where: { id: requestId }, data: { status: next, adminNote: adminNote || null } });
      if (status && status !== req.status) {
        const kind = req.type === "EXCHANGE" ? "exchange" : "return";
        const publicMsg: Record<ReturnStatus, string> = {
          REQUESTED: `Your ${kind} request was reopened`,
          APPROVED: `Your ${kind} request was approved`,
          REJECTED: `Your ${kind} request was declined`,
          RECEIVED: `We've received your ${kind === "exchange" ? "item for exchange" : "returned item"}`,
          COMPLETED: kind === "exchange" ? "Your exchange is complete" : "Your return is complete",
        };
        await tx.orderEvent.create({ data: { orderId: req.orderId, message: publicMsg[status], isPublic: true, actor: user.name } });
        msg = `Request marked as “${RETURN_STATUS_LABEL[status]}”.`;

        if (status === "COMPLETED" && req.type === "RETURN" && markOrderReturned) {
          const res = await tx.order.updateMany({ where: { id: req.orderId, status: { in: ["SHIPPED", "DELIVERED"] } }, data: { status: "RETURNED" } });
          if (res.count === 1) {
            await tx.orderEvent.create({ data: { orderId: req.orderId, status: "RETURNED", message: "Order returned", isPublic: true, actor: user.name } });
            if (restock) {
              await restockOrder(tx, req.orderId);
              await tx.orderEvent.create({ data: { orderId: req.orderId, message: "Returned items added back to stock", isPublic: false, actor: user.name } });
            }
            msg += restock ? " Order marked returned and restocked." : " Order marked returned.";
          } else {
            msg += ` (Order status is “${req.order.status.toLowerCase()}”, so it wasn't changed.)`;
          }
        }
      }
    });
    revalidatePath("/admin/returns");
    revalidatePath(`/admin/returns/${requestId}`);
    if (orderId) touchOrder(orderId);
    return { ok: true, message: msg };
  } catch (e) {
    return fail(e);
  }
}

/* ------------------------------------------------------------------------- */
/*                                 customers                                 */
/* ------------------------------------------------------------------------- */

export async function updateCustomerTagsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
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
    const res = await db.user.updateMany({ where: { id: userId, role: "CUSTOMER" }, data: { tags } });
    if (res.count !== 1) return { ok: false, message: "Customer not found." };
    revalidatePath(`/admin/customers/${userId}`);
    revalidatePath("/admin/customers");
    return { ok: true, message: tags.length ? "Tags saved." : "Tags cleared." };
  } catch (e) {
    return fail(e);
  }
}

export async function setCustomerActiveAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
    const userId = str(fd, "userId");
    const active = bool(fd.get("active"));
    await db.$transaction(async (tx) => {
      const res = await tx.user.updateMany({ where: { id: userId, role: "CUSTOMER" }, data: { isActive: active } });
      if (res.count !== 1) throw new UserError("Customer not found.");
      if (!active) await tx.session.deleteMany({ where: { userId } });
    });
    revalidatePath(`/admin/customers/${userId}`);
    revalidatePath("/admin/customers");
    return { ok: true, message: active ? "Account enabled." : "Account disabled and signed out everywhere." };
  } catch (e) {
    return fail(e);
  }
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
  let savedId = "";
  try {
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
    if (!parsed.success) {
      return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
    }
    const v = parsed.data;
    const data = {
      code: v.code,
      description: v.description || null,
      type: v.type,
      value: v.value,
      minSubtotal: v.minSubtotal || null,
      maxUses: v.maxUses,
      startsAt: v.startsAt ? new Date(`${v.startsAt}T00:00:00`) : null,
      endsAt: v.endsAt ? new Date(`${v.endsAt}T23:59:59`) : null,
      isActive: v.isActive,
    };
    if (v.id) {
      const c = await db.coupon.update({ where: { id: v.id }, data });
      savedId = c.id;
    } else {
      const c = await db.coupon.create({ data });
      savedId = c.id;
    }
    revalidatePath("/admin/coupons");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "That code is already in use.", errors: { code: ["That code is already in use."] } };
    }
    return fail(e);
  }
  redirect(`/admin/coupons?saved=${savedId}`);
}

export async function deleteCouponAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
    const couponId = str(fd, "id");
    await db.coupon.delete({ where: { id: couponId } });
    revalidatePath("/admin/coupons");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return { ok: false, message: "Coupon not found." };
    return fail(e);
  }
  redirect("/admin/coupons?deleted=1");
}

export async function toggleCouponAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
    const couponId = str(fd, "id");
    const active = bool(fd.get("active"));
    await db.coupon.update({ where: { id: couponId }, data: { isActive: active } });
    revalidatePath("/admin/coupons");
    return { ok: true, message: active ? "Coupon activated." : "Coupon paused." };
  } catch (e) {
    return fail(e);
  }
}
