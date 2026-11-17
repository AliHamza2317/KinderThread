import { z } from "zod";
import { PK_PHONE_RE } from "@/lib/pk-cities";

/** Checkout validation (shared so the backend can reuse it later). */
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => PK_PHONE_RE.test(v), "Enter a mobile number like 03XX XXXXXXX."),
  email: z.email("Enter a valid email address.").max(160),
  city: z.string().trim().min(2, "Please enter your city.").max(60),
  address: z.string().trim().min(8, "Please enter your complete address (house, street, area).").max(300),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["cod", "bank", "jazzcash", "easypaisa"], { message: "Choose a payment method." }),
  paymentReference: z.string().trim().max(60).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
