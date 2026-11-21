import type { BadgeTone } from "@/components/ui/badge";
import type { CouponType, PaymentStatus, ReturnStatus, ReturnType } from "@/lib/types";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PENDING_VERIFICATION: "Awaiting verification",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  UNPAID: "neutral",
  PENDING_VERIFICATION: "warning",
  PAID: "success",
  REFUNDED: "danger",
};

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RECEIVED: "Item received",
  COMPLETED: "Completed",
};

export const RETURN_STATUS_TONE: Record<ReturnStatus, BadgeTone> = {
  REQUESTED: "warning",
  APPROVED: "info",
  REJECTED: "danger",
  RECEIVED: "info",
  COMPLETED: "success",
};

export const RETURN_TYPE_LABEL: Record<ReturnType, string> = { RETURN: "Return", EXCHANGE: "Exchange" };

/** Allowed next steps for a return / exchange request. */
export const RETURN_NEXT: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED", "COMPLETED", "REJECTED"],
  RECEIVED: ["COMPLETED", "REJECTED"],
  REJECTED: ["REQUESTED"],
  COMPLETED: [],
};

export const COUPON_TYPE_LABEL: Record<CouponType, string> = {
  PERCENT: "Percentage off",
  FIXED: "Fixed amount off",
  FREE_SHIPPING: "Free delivery",
};

export const COURIERS = ["TCS", "Leopards Courier", "PostEx", "Trax", "M&P", "BlueEx", "Call Courier", "Swyft", "Pakistan Post", "Rider", "Own delivery"];

export type Segment = "PROSPECT" | "NEW" | "REPEAT" | "VIP" | "INACTIVE";

export const SEGMENT_LABEL: Record<Segment, string> = {
  PROSPECT: "Prospect",
  NEW: "New",
  REPEAT: "Repeat",
  VIP: "VIP",
  INACTIVE: "Inactive",
};

export const SEGMENT_TONE: Record<Segment, BadgeTone> = {
  PROSPECT: "neutral",
  NEW: "info",
  REPEAT: "success",
  VIP: "sale",
  INACTIVE: "out",
};

export const SEGMENT_HINT: Record<Segment, string> = {
  PROSPECT: "Registered, no orders yet",
  NEW: "One order",
  REPEAT: "Two or more orders",
  VIP: "Lifetime spend of Rs 15,000+",
  INACTIVE: "No order in the last 90 days",
};

export const VIP_SPEND = 15000;
export const INACTIVE_DAYS = 90;

export function segmentFor(orders: number, spend: number, lastOrder: Date | null): Segment {
  if (orders === 0) return "PROSPECT";
  if (lastOrder && Date.now() - lastOrder.getTime() > INACTIVE_DAYS * 864e5) return "INACTIVE";
  if (spend >= VIP_SPEND) return "VIP";
  if (orders >= 2) return "REPEAT";
  return "NEW";
}

export type CouponState = "inactive" | "scheduled" | "expired" | "exhausted" | "active";

export function couponState(c: { isActive: boolean; startsAt: Date | null; endsAt: Date | null; maxUses: number | null; usedCount: number }): CouponState {
  const now = new Date();
  if (!c.isActive) return "inactive";
  if (c.endsAt && c.endsAt < now) return "expired";
  if (c.maxUses != null && c.usedCount >= c.maxUses) return "exhausted";
  if (c.startsAt && c.startsAt > now) return "scheduled";
  return "active";
}

export const COUPON_STATE_TONE: Record<CouponState, BadgeTone> = {
  active: "success",
  scheduled: "info",
  expired: "neutral",
  exhausted: "warning",
  inactive: "out",
};
