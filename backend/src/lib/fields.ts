import { z } from "zod";

/** Reusable validation rules, so every form checks emails, phones, ids … the same way. */

const MOBILE_RE = /^03\d{9}$/;
const PHONE_MESSAGE = "Enter a Pakistani mobile number, e.g. 0300 1234567.";

/** "+92 300-1234567" or "92300 1234567" → "03001234567" */
export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "").replace(/^\+?92/, "0");
}

export const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(160));

export const phone = z.string().trim().transform(normalizePhone).refine((v) => MOBILE_RE.test(v), PHONE_MESSAGE);

/** Optional phone: an empty string becomes null. */
export const optionalPhone = z
  .string()
  .trim()
  .transform((v) => (v ? normalizePhone(v) : ""))
  .refine((v) => v === "" || MOBILE_RE.test(v), PHONE_MESSAGE)
  .transform((v) => v || null);

export const password = z.string().min(8, "Use at least 8 characters.").max(200, "That password is too long.");

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(90)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only.");

/** Optional text: empty strings are stored as null. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null);

/** Whole rupees. */
export const rupees = z.number().int("Use whole rupees.").min(0).max(10_000_000);

/** A date from a form ("2026-12-31") or ISO string; empty means "no date". */
export const optionalDate = z
  .union([z.literal(""), z.null(), z.iso.date(), z.iso.datetime({ offset: true })])
  .optional()
  .transform((v) => (v ? new Date(v) : null));
