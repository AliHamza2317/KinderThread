import { z } from "zod";
import { optionalDate } from "../../lib/fields.js";
import { COUPON_TYPES } from "./coupon.model.js";

export const couponInput = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .transform((v) => v.replace(/\s+/g, ""))
      .pipe(
        z
          .string()
          .min(3, "Codes need at least 3 characters.")
          .max(32, "Codes can be up to 32 characters.")
          .regex(/^[A-Z0-9_-]+$/, "Use letters, numbers, dashes or underscores only."),
      ),
    description: z.string().trim().max(160).nullish().transform((v) => v || null),
    type: z.enum(COUPON_TYPES),
    value: z.number().int("Use a whole number.").min(0).default(0),
    minSubtotal: z.number().int().min(0).nullable().default(null),
    maxUses: z.number().int().min(1, "Max uses must be at least 1.").nullable().default(null),
    startsAt: optionalDate,
    endsAt: optionalDate,
    isActive: z.boolean().default(true),
  })
  .superRefine((c, ctx) => {
    if (c.type === "PERCENT" && (c.value < 1 || c.value > 100)) ctx.addIssue({ code: "custom", path: ["value"], message: "Percentage must be between 1 and 100." });
    if (c.type === "FIXED" && c.value < 1) ctx.addIssue({ code: "custom", path: ["value"], message: "Enter the discount amount in rupees." });
    if (c.startsAt && c.endsAt && c.endsAt < c.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after the start date." });
  })
  .transform((c) => (c.type === "FREE_SHIPPING" ? { ...c, value: 0 } : c));

export type CouponInput = z.infer<typeof couponInput>;

export const couponActiveInput = z.object({ isActive: z.boolean() });
