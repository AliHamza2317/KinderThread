import { conflict, notFound } from "../../lib/http-error.js";
import { Coupon, type CouponDocument } from "./coupon.model.js";
import type { CouponInput } from "./coupon.validation.js";


/** Why a coupon can't be used right now, or null when it can. */
export function couponProblem(coupon: CouponDocument | null, subtotal: number, now = new Date()): string | null {
  if (!coupon || !coupon.isActive) return "This code isn't valid.";
  if (coupon.startsAt && coupon.startsAt > now) return "This code isn't active yet.";
  if (coupon.endsAt && coupon.endsAt < now) return "This code has expired.";
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return "This code has reached its usage limit.";
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return `Spend Rs. ${coupon.minSubtotal.toLocaleString("en-PK")} or more to use this code.`;
  }
  return null;
}

export const findCouponByCode = (code: string) => Coupon.findOne({ code: code.trim().toUpperCase() });

/**
 * Counts one use of a coupon — atomically, so two customers can't both take the last use.
 * Returns false when the limit was reached in the meantime.
 */
export async function useCoupon(code: string): Promise<boolean> {
  const result = await Coupon.updateOne(
    { code, isActive: true, $or: [{ maxUses: null }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }] },
    { $inc: { usedCount: 1 } },
  );
  return result.modifiedCount === 1;
}

export async function releaseCoupon(code: string) {
  await Coupon.updateOne({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
}

/* admin */

export const listCoupons = () => Coupon.find().sort({ createdAt: -1 });

async function assertCodeFree(code: string, excludeId?: string) {
  const owner = await Coupon.findOne({ code }).select("_id");
  if (owner && owner.id !== excludeId) throw conflict("That code is already in use.", { code: ["That code is already in use."] });
}

export async function createCoupon(input: CouponInput) {
  await assertCodeFree(input.code);
  return Coupon.create(input);
}

export async function updateCoupon(id: string, input: CouponInput) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw notFound("Coupon not found.");
  await assertCodeFree(input.code, id);
  coupon.set(input);
  return coupon.save();
}

export async function setCouponActive(id: string, isActive: boolean) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw notFound("Coupon not found.");
  coupon.isActive = isActive;
  return coupon.save();
}

export async function deleteCoupon(id: string) {
  if (!(await Coupon.findByIdAndDelete(id))) throw notFound("Coupon not found.");
}
