import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions } from "../../db/schema-options.js";

export const COUPON_TYPES = ["PERCENT", "FIXED", "FREE_SHIPPING"] as const;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: null },
    type: { type: String, enum: COUPON_TYPES, required: true },
    // percent (1–100) or rupees, depending on the type; 0 for free shipping
    value: { type: Number, default: 0 },
    minSubtotal: { type: Number, default: null },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  baseOptions,
);

export type CouponDocument = HydratedDocument<InferSchemaType<typeof couponSchema>>;

export const Coupon = model("Coupon", couponSchema);
