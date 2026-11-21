import { z } from "zod";
import { objectId } from "../../lib/fields.js";

export const MAX_QTY_PER_LINE = 10;

export const PAYMENT_METHODS = ["cod", "bank", "jazzcash", "easypaisa"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const cartLines = z
  .array(z.object({ variantId: objectId, quantity: z.number().int().min(0).max(50) }))
  .max(60, "Your bag has too many lines.");

export type CartLine = z.infer<typeof cartLines>[number];

export const quoteInput = z.object({
  lines: cartLines,
  couponCode: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
});
