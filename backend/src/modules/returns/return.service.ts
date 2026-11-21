import type { Types } from "mongoose";
import type { z } from "zod";
import { conflict, notFound } from "../../lib/http-error.js";
import { skipFor, toPage } from "../../lib/pagination.js";
import type { AuthUser } from "../../middleware/auth.js";
import { getSettings } from "../content/settings.service.js";
import { markReturned } from "../orders/order.admin.service.js";
import type { OrderDocument } from "../orders/order.model.js";
import { OPEN_RETURN_STATUSES, RETURN_NEXT, ReturnRequest, type ReturnRequestDocument, type ReturnStatus } from "./return.model.js";
import type { adminReturnQuery, ReturnRequestInput, returnUpdateInput } from "./return.validation.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReturnEligibility = { eligible: boolean; reason: string | null; deadline: Date | null };

/**
 * A delivered order can be returned or exchanged within the store's return window
 * (Settings → policies), counted from the delivery date, with one open request at a time.
 */
export async function returnEligibility(order: OrderDocument, now = new Date()): Promise<ReturnEligibility> {
  const { returnWindowDays: days } = (await getSettings()).policies;
  if (order.status !== "DELIVERED") return { eligible: false, reason: "Returns can be requested once your order has been delivered.", deadline: null };
  if (days <= 0) return { eligible: false, reason: "Returns are not available for this order.", deadline: null };

  const delivered = order.events.filter((e) => e.status === "DELIVERED").at(-1);
  const deliveredAt = delivered?.createdAt ?? order.updatedAt;
  const deadline = new Date(deliveredAt.getTime() + days * DAY_MS);
  if (now > deadline) return { eligible: false, reason: `The ${days}-day return window for this order has closed.`, deadline };

  const open = await ReturnRequest.exists({ order: order._id, status: { $in: OPEN_RETURN_STATUSES } });
  if (open) return { eligible: false, reason: "We've received your request and will be in touch within 1–2 working days.", deadline };

  return { eligible: true, reason: null, deadline };
}

/** What a customer sees of their request (staff notes stay private). */
export const toCustomerReturn = (request: ReturnRequestDocument) => ({
  id: request.id as string,
  type: request.type,
  status: request.status,
  reason: request.reason,
  details: request.details ?? null,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
});

export async function requestReturn(order: OrderDocument, userId: string, input: ReturnRequestInput) {
  const check = await returnEligibility(order);
  if (!check.eligible) throw conflict(check.reason ?? "This order isn't eligible for a return.");
  return toCustomerReturn(await ReturnRequest.create({ ...input, order: order._id, user: userId }));
}

export async function customerReturnsForOrder(orderId: Types.ObjectId) {
  const requests = await ReturnRequest.find({ order: orderId }).sort({ createdAt: -1 });
  return requests.map(toCustomerReturn);
}

/* admin */

export async function listReturns(query: z.infer<typeof adminReturnQuery>) {
  const filter = query.status ? { status: query.status } : {};
  const [items, total] = await Promise.all([
    ReturnRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipFor(query))
      .limit(query.limit)
      .populate("order", "number customerName phone total status"),
    ReturnRequest.countDocuments(filter),
  ]);
  return toPage(items, total, query);
}

export async function updateReturn(id: string, input: z.infer<typeof returnUpdateInput>, actor: AuthUser) {
  const request = await ReturnRequest.findById(id);
  if (!request) throw notFound("Request not found.");

  if (input.status && input.status !== request.status) {
    const allowed: ReturnStatus[] = RETURN_NEXT[request.status];
    if (!allowed.includes(input.status)) {
      throw conflict(`A ${request.status.toLowerCase()} request can't move to ${input.status.toLowerCase()}.`);
    }
    request.status = input.status;
  }
  if (input.adminNote !== undefined) request.adminNote = input.adminNote || null;
  await request.save();

  // optionally close the loop on the order itself (only for returns, once the item is back)
  if (input.markOrderReturned && request.type === "RETURN" && ["RECEIVED", "COMPLETED"].includes(request.status)) {
    await markReturned(String(request.order), { restock: input.restock, note: "Return request completed" }, actor).catch((error: unknown) => {
      // already returned/cancelled orders are fine to leave as they are
      if ((error as { status?: number }).status !== 409) throw error;
    });
  }
  return request;
}
