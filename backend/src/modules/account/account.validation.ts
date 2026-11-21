import { z } from "zod";
import { email, objectId, optionalPhone, password, phone } from "../../lib/fields.js";
import { paging } from "../../lib/pagination.js";

export const profileInput = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email,
  phone: optionalPhone,
});

export const passwordInput = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    password,
  })
  .refine((d) => d.password !== d.current, { path: ["password"], message: "Choose a password different from your current one." });

export const addressInput = z.object({
  label: z.string().trim().max(40).nullish().transform((v) => v || null),
  fullName: z.string().trim().min(2, "Enter the recipient's name.").max(80),
  phone,
  city: z.string().trim().min(2, "Enter a city.").max(60),
  line1: z.string().trim().min(5, "Enter the street address.").max(200),
  line2: z.string().trim().max(200).nullish().transform((v) => v || null),
  postalCode: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{5}$/.test(v), "Postal codes in Pakistan have 5 digits.")
    .nullish()
    .transform((v) => v || null),
  isDefault: z.boolean().default(false),
});

export const wishlistInput = z.object({ productIds: z.array(objectId).max(200) });

export const myOrdersQuery = z.object(paging(20));

export type ProfileInput = z.infer<typeof profileInput>;
export type AddressInput = z.infer<typeof addressInput>;
