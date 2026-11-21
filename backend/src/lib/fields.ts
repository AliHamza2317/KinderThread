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

/** bcrypt only reads the first 72 bytes of a password, so longer ones are refused. */
export const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .refine((v) => Buffer.byteLength(v) <= 72, "Use at most 72 characters.");

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

/**
 * A date from a form ("2026-12-31") or a full ISO timestamp; empty means "no date".
 * Plain dates are read in Pakistan time (UTC+5, no daylight saving): "start" gives
 * 00:00 that day, "end" gives 23:59:59 — so a coupon ending on the 31st works all day.
 */
const PK_OFFSET = "+05:00";

export const optionalDate = (edge: "start" | "end") =>
  z
    .union([z.literal(""), z.null(), z.iso.date(), z.iso.datetime({ offset: true })])
    .optional()
    .transform((v) => {
      if (!v) return null;
      if (v.length > 10) return new Date(v);
      return new Date(`${v}T${edge === "start" ? "00:00:00.000" : "23:59:59.999"}${PK_OFFSET}`);
    });

/** A link shown on the site: a path on this site ("/shop") or an http(s) address — never "javascript:". */
export const safeLink = z
  .string()
  .trim()
  .max(600)
  .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\//i.test(v), "Use a link starting with / or https://");

/** Optional safe link: empty becomes null. */
export const optionalLink = z
  .union([z.literal(""), safeLink])
  .nullish()
  .transform((v) => v || null);
