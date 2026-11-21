import { z } from "zod";
import { email, optionalDate, phone } from "../../lib/fields.js";
import { paging } from "../../lib/pagination.js";
import { cartLines, PAYMENT_METHODS } from "../cart/cart.validation.js";
import { ORDER_FLOW, ORDER_STATUSES, PAYMENT_STATUSES } from "./order.model.js";

/** Everything the checkout form sends. Prices are NOT accepted — the server works them out. */
export const checkoutInput = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  phone,
  email,
  city: z.string().trim().min(2, "Please enter your city.").max(60),
  address: z.string().trim().min(8, "Please enter your complete address (house, street, area).").max(300),
  postalCode: z.string().trim().max(10).nullish().transform((v) => v || null),
  notes: z.string().trim().max(500).nullish().transform((v) => v || null),
  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Choose a payment method." }),
  paymentReference: z.string().trim().max(60).nullish().transform((v) => v || null),
  couponCode: z.string().trim().max(40).nullish().transform((v) => v || null),
  lines: cartLines.min(1, "Your bag is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutInput>;

export const trackQuery = z.object({
  number: z.string().trim().toUpperCase().min(3, "Enter your order number.").max(40),
  phone,
});

/* admin */

export const adminOrderQuery = z.object({
  q: z.string().trim().max(80).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  from: optionalDate("start"),
  to: optionalDate("end"),
  ...paging(),
});

export const statusInput = z.object({
  status: z.enum(ORDER_FLOW, { message: "Choose a status." }),
  note: z.string().trim().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const noteInput = z.object({
  message: z.string().trim().min(2, "Write a short note.").max(500),
  isPublic: z.boolean().default(false),
});

export const internalNoteInput = z.object({ internalNote: z.string().trim().max(2000, "Internal note is too long (2,000 characters max).") });

export const paymentInput = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
  paymentReference: z.string().trim().max(120).optional(),
});

export const shippingInput = z
  .object({
    courier: z.string().trim().max(60).default(""),
    trackingNumber: z.string().trim().max(80).default(""),
    trackingUrl: z
      .union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a full tracking link starting with https://" }).max(400)])
      .default(""),
    markShipped: z.boolean().default(false),
  })
  .refine((s) => !s.trackingNumber || s.courier, { path: ["courier"], message: "Add the courier name for this tracking number." });

export const cancelInput = z.object({ reason: z.string().trim().max(300).default("") });

export const returnedInput = z.object({ restock: z.boolean().default(true), note: z.string().trim().max(300).default("") });

