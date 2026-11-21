import type { QueryFilter } from "mongoose";
import type { z } from "zod";
import { conflict, notFound } from "../../lib/http-error.js";
import { skipFor, toPage } from "../../lib/pagination.js";
import { containsText } from "../../lib/text.js";
import type { AuthUser } from "../../middleware/auth.js";
import { releaseCoupon } from "../coupons/coupon.service.js";
import { Order, ORDER_STATUS_LABEL, type OrderDocument, type OrderStatus, type PaymentStatus } from "./order.model.js";
import type { adminOrderQuery, cancelInput, internalNoteInput, noteInput, paymentInput, returnedInput, shippingInput, statusInput } from "./order.validation.js";
import { recordSales, releaseStock } from "./stock.service.js";

/** Orders that have ended can't move any more. */
const FINAL_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

const PAYMENT_EVENT: Record<PaymentStatus, string> = {
  UNPAID: "Payment marked as unpaid",
  PENDING_VERIFICATION: "Payment awaiting verification",
  PAID: "Payment received",
  REFUNDED: "Payment refunded",
};

export async function listOrders(query: z.infer<typeof adminOrderQuery>) {
  const filter: QueryFilter<OrderDocument> = {};
  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.from || query.to) {
    const to = query.to ? new Date(query.to.getTime() + 24 * 60 * 60 * 1000) : undefined; // include the whole "to" day
    filter.createdAt = { ...(query.from && { $gte: query.from }), ...(to && { $lt: to }) };
  }
  if (query.q) {
    const text = containsText(query.q);
    filter.$or = [{ number: text }, { customerName: text }, { email: text }, { phone: text }];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipFor(query))
      .limit(query.limit)
      .select("number customerName email phone city status paymentMethod paymentStatus total items.quantity createdAt"),
    Order.countDocuments(filter),
  ]);
  const items = orders.map((o) => ({
    id: o.id as string,
    number: o.number,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    city: o.city,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    total: o.total,
    itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: o.createdAt,
  }));
  return toPage(items, total, query);
}

export async function getOrder(id: string): Promise<OrderDocument> {
  const order = await Order.findById(id);
  if (!order) throw notFound("Order not found.");
  return order;
}

function addEvent(order: OrderDocument, event: { status?: OrderStatus | null; message: string; isPublic: boolean; actor: AuthUser }) {
  order.events.push({ status: event.status ?? null, message: event.message, isPublic: event.isPublic, actor: event.actor.name, createdAt: new Date() });
}

const stockItemsOf = (order: OrderDocument) =>
  order.items.filter((item) => item.product && item.variant).map((item) => ({ productId: String(item.product), variantId: String(item.variant), quantity: item.quantity }));

/** Puts the order's items back into stock once (cancelled or returned orders). */
async function restock(order: OrderDocument) {
  if (order.stockReleased) return;
  const items = stockItemsOf(order);
  await releaseStock(items);
  await recordSales(items, -1);
  order.stockReleased = true;
}

export async function updateStatus(id: string, input: z.infer<typeof statusInput>, actor: AuthUser) {
  const order = await getOrder(id);
  const status = input.status as OrderStatus;
  if (FINAL_STATUSES.includes(order.status)) throw conflict(`This order is ${order.status.toLowerCase()} and can no longer change status.`);
  if (order.status === status) throw conflict(`The order is already “${ORDER_STATUS_LABEL[status]}”.`);

  order.status = status;
  addEvent(order, { status, message: input.note || ORDER_STATUS_LABEL[status], isPublic: input.isPublic, actor });
  return order.save();
}

export async function addNote(id: string, input: z.infer<typeof noteInput>, actor: AuthUser) {
  const order = await getOrder(id);
  addEvent(order, { message: input.message, isPublic: input.isPublic, actor });
  return order.save();
}

export async function updateInternalNote(id: string, input: z.infer<typeof internalNoteInput>) {
  const order = await getOrder(id);
  order.internalNote = input.internalNote || null;
  return order.save();
}

export async function updatePayment(id: string, input: z.infer<typeof paymentInput>, actor: AuthUser) {
  const order = await getOrder(id);
  if (order.paymentStatus === input.paymentStatus && input.paymentReference === undefined) {
    throw conflict(`Payment is already “${PAYMENT_EVENT[input.paymentStatus].toLowerCase()}”.`);
  }
  order.paymentStatus = input.paymentStatus;
  if (input.paymentReference !== undefined) order.paymentReference = input.paymentReference || null;
  addEvent(order, { message: PAYMENT_EVENT[input.paymentStatus], isPublic: false, actor });
  return order.save();
}

export async function updateShipping(id: string, input: z.infer<typeof shippingInput>, actor: AuthUser) {
  const order = await getOrder(id);
  if (FINAL_STATUSES.includes(order.status)) throw conflict(`This order was ${order.status.toLowerCase()}.`);

  order.courier = input.courier || null;
  order.trackingNumber = input.trackingNumber || null;
  order.trackingUrl = input.trackingUrl || null;

  const tracking = [input.courier, input.trackingNumber && `tracking ${input.trackingNumber}`].filter(Boolean).join(" — ");
  if (input.markShipped && order.status !== "SHIPPED" && order.status !== "DELIVERED") {
    order.status = "SHIPPED";
    addEvent(order, { status: "SHIPPED", message: tracking ? `Shipped with ${tracking}` : "Shipped", isPublic: true, actor });
  } else {
    addEvent(order, { message: tracking ? `Tracking updated: ${tracking}` : "Tracking details removed", isPublic: false, actor });
  }
  return order.save();
}

/** Cancels an order that hasn't been delivered; its items go back into stock. */
export async function cancelOrder(id: string, input: z.infer<typeof cancelInput>, actor: AuthUser) {
  const order = await getOrder(id);
  if (!["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)) {
    throw conflict("Only orders that haven't been delivered (and aren't already cancelled) can be cancelled.");
  }
  await restock(order);
  if (order.couponCode) await releaseCoupon(order.couponCode);
  order.status = "CANCELLED";
  addEvent(order, { status: "CANCELLED", message: input.reason ? `Order cancelled — ${input.reason}` : "Order cancelled", isPublic: true, actor });
  return order.save();
}

/** Marks a shipped/delivered order as returned, optionally putting the items back into stock. */
export async function markReturned(id: string, input: z.infer<typeof returnedInput>, actor: AuthUser) {
  const order = await getOrder(id);
  if (order.status !== "SHIPPED" && order.status !== "DELIVERED") {
    throw conflict("Only shipped or delivered orders can be marked as returned.");
  }
  if (input.restock) await restock(order);
  order.status = "RETURNED";
  addEvent(order, { status: "RETURNED", message: input.note ? `Order returned — ${input.note}` : "Order returned", isPublic: true, actor });
  return order.save();
}

