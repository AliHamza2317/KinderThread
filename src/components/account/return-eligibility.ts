import "server-only";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export type ReturnEligibility = { eligible: boolean; reason?: string; deadline?: Date };

/** Return/exchange window rule shared by the order page and the request action. */
export async function returnEligibility(orderId: string, status: string, updatedAt: Date): Promise<ReturnEligibility> {
  const settings = await getSettings();
  const days = settings.policies.returnWindowDays;
  if (status !== "DELIVERED") return { eligible: false, reason: "Returns can be requested once your order has been delivered." };
  if (days <= 0) return { eligible: false, reason: "Returns are not available for this order." };
  const delivered = await db.orderEvent.findFirst({ where: { orderId, status: "DELIVERED" }, orderBy: { createdAt: "desc" } });
  const deliveredAt = delivered?.createdAt ?? updatedAt;
  const deadline = new Date(deliveredAt.getTime() + days * 24 * 60 * 60 * 1000);
  if (Date.now() > deadline.getTime()) return { eligible: false, reason: `The ${days}-day return window for this order has closed.`, deadline };
  const open = await db.returnRequest.count({ where: { orderId, status: { in: ["REQUESTED", "APPROVED", "RECEIVED"] } } });
  if (open > 0)
    return { eligible: false, reason: "We've received your request and will be in touch within 1–2 working days. Its status will update here.", deadline };
  return { eligible: true, deadline };
}
