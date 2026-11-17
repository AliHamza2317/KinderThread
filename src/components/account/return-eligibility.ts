import "server-only";
import { ORDERS, RETURNS } from "@/data/admin";
import { getSettings } from "@/lib/settings";

export type ReturnEligibility = { eligible: boolean; reason?: string; deadline?: Date };

/**
 * The dummy data is a fixed snapshot, so the return window is measured from the
 * snapshot's latest activity rather than the real clock — otherwise the demo
 * would change as days pass. With a live backend, use Date.now() here.
 */
const DEMO_NOW = Math.max(...ORDERS.flatMap((o) => o.events.map((e) => e.createdAt.getTime())));

/** Return/exchange window rule shared by the order page and the request action. */
export async function returnEligibility(orderId: string, status: string, updatedAt: Date): Promise<ReturnEligibility> {
  const settings = await getSettings();
  const days = settings.policies.returnWindowDays;
  if (status !== "DELIVERED") return { eligible: false, reason: "Returns can be requested once your order has been delivered." };
  if (days <= 0) return { eligible: false, reason: "Returns are not available for this order." };
  const order = ORDERS.find((o) => o.id === orderId);
  const delivered = order?.events.filter((e) => e.status === "DELIVERED").at(-1);
  const deliveredAt = delivered?.createdAt ?? updatedAt;
  const deadline = new Date(deliveredAt.getTime() + days * 24 * 60 * 60 * 1000);
  if (DEMO_NOW > deadline.getTime()) return { eligible: false, reason: `The ${days}-day return window for this order has closed.`, deadline };
  const open = RETURNS.filter((r) => r.orderId === orderId && ["REQUESTED", "APPROVED", "RECEIVED"].includes(r.status)).length;
  if (open > 0)
    return { eligible: false, reason: "We've received your request and will be in touch within 1–2 working days. Its status will update here.", deadline };
  return { eligible: true, deadline };
}
