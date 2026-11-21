"use server";

/**
 * Customer account actions — FRONTEND-ONLY build.
 *
 * There is no database or authentication yet, so these actions still validate
 * input (so the forms behave exactly as they will in production) but don't
 * store anything. Sign-in / sign-up simply continue to the demo account.
 * Replace the bodies with real API calls once the MongoDB backend exists.
 */

import { redirect } from "next/navigation";
import { z } from "zod";
import { ADDRESSES, ORDERS } from "@/data/admin";
import { requireUser } from "@/lib/auth";
import { demoResult } from "@/lib/demo";
import { PK_PHONE_RE } from "@/lib/pk-cities";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { RETURN_REASONS } from "@/components/account/constants";
import { returnEligibility } from "@/components/account/return-eligibility";

/* -------------------------------------------------------------------------- */
/* helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Only allow same-site relative redirects, never back to the auth pages. */
function safeNext(raw: unknown, fallback = "/account") {
  const n = typeof raw === "string" ? raw.trim() : "";
  if (!n.startsWith("/") || n.startsWith("//") || n.startsWith("/\\")) return fallback;
  if (/^\/account\/(login|register|forgot)/.test(n)) return fallback;
  if (n.length > 300) return fallback;
  return n;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

const phoneField = z
  .string()
  .trim()
  .refine((v) => PK_PHONE_RE.test(v.replace(/[\s-]/g, "")), "Enter a Pakistani mobile number, e.g. 0300 1234567.");

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || PK_PHONE_RE.test(v.replace(/[\s-]/g, "")), "Enter a Pakistani mobile number, e.g. 0300 1234567.");

const passwordField = z.string().min(8, "Use at least 8 characters.").max(200, "That password is too long.");

const invalid = (issues: { path: PropertyKey[]; message: string }[]): ActionResult => ({
  ok: false,
  message: "Please check the highlighted fields.",
  errors: fieldErrors(issues),
});

/* -------------------------------------------------------------------------- */
/* login / register                                                            */
/* -------------------------------------------------------------------------- */

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").max(160),
  password: z.string().min(1, "Enter your password.").max(200),
});

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: str(formData, "email").toLowerCase(), password: formData.get("password") ?? "" });
  if (!parsed.success) return invalid(parsed.error.issues);
  // Demo: no authentication yet — continue to the sample account.
  redirect(safeNext(formData.get("next")));
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name.").max(80),
    email: z.email("Enter a valid email address.").max(160),
    phone: optionalPhone,
    password: passwordField,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function registerAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (formData.get("company")) return { ok: false, message: "Something went wrong. Please try again." }; // honeypot
  const parsed = registerSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email").toLowerCase(),
    phone: str(formData, "phone"),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return invalid(parsed.error.issues);
  // Demo: no accounts are created yet — continue to the sample account.
  redirect(safeNext(formData.get("next")));
}

/* -------------------------------------------------------------------------- */
/* addresses                                                                   */
/* -------------------------------------------------------------------------- */

const addressSchema = z.object({
  label: z.string().trim().max(40).optional().default(""),
  fullName: z.string().trim().min(2, "Enter the recipient's name.").max(80),
  phone: phoneField,
  city: z.string().trim().min(2, "Enter a city.").max(60),
  line1: z.string().trim().min(5, "Enter the street address.").max(200),
  line2: z.string().trim().max(200).optional().default(""),
  postalCode: z
    .string()
    .trim()
    .max(10)
    .refine((v) => v === "" || /^\d{5}$/.test(v), "Postal codes in Pakistan have 5 digits.")
    .optional()
    .default(""),
  isDefault: z.boolean(),
});

async function ownsAddress(id: string) {
  const user = await requireUser();
  return ADDRESSES.some((a) => a.id === id && a.userId === user.id);
}

export async function saveAddressAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const parsed = addressSchema.safeParse({
    label: str(formData, "label"),
    fullName: str(formData, "fullName"),
    phone: str(formData, "phone"),
    city: str(formData, "city"),
    line1: str(formData, "line1"),
    line2: str(formData, "line2"),
    postalCode: str(formData, "postalCode"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return invalid(parsed.error.issues);
  if (id && !(await ownsAddress(id))) return { ok: false, message: "That address could not be found." };
  return demoResult();
}

export async function deleteAddressAction(id: string): Promise<ActionResult> {
  if (!(await ownsAddress(String(id)))) return { ok: false, message: "That address could not be found." };
  return demoResult();
}

export async function setDefaultAddressAction(id: string): Promise<ActionResult> {
  if (!(await ownsAddress(String(id)))) return { ok: false, message: "That address could not be found." };
  return demoResult();
}

/* -------------------------------------------------------------------------- */
/* profile                                                                     */
/* -------------------------------------------------------------------------- */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.email("Enter a valid email address.").max(160),
  phone: optionalPhone,
});

export async function updateProfileAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email").toLowerCase(),
    phone: str(formData, "phone"),
  });
  if (!parsed.success) return invalid(parsed.error.issues);
  return demoResult();
}

const passwordSchema = z
  .object({ current: z.string().min(1, "Enter your current password."), password: passwordField, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." })
  .refine((d) => d.password !== d.current, { path: ["password"], message: "Choose a password different from your current one." });

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return invalid(parsed.error.issues);
  return demoResult();
}

export async function signOutEverywhereAction(): Promise<ActionResult> {
  return demoResult();
}

/* -------------------------------------------------------------------------- */
/* returns & exchanges                                                         */
/* -------------------------------------------------------------------------- */

const returnSchema = z.object({
  orderNumber: z.string().min(3).max(40),
  type: z.enum(["RETURN", "EXCHANGE"], { message: "Choose return or exchange." }),
  reason: z.enum(RETURN_REASONS, { message: "Choose a reason." }),
  details: z.string().trim().max(1000, "Please keep it under 1000 characters.").optional().default(""),
});

export async function requestReturnAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = returnSchema.safeParse({
    orderNumber: str(formData, "orderNumber"),
    type: str(formData, "type"),
    reason: str(formData, "reason"),
    details: str(formData, "details"),
  });
  if (!parsed.success) return invalid(parsed.error.issues);
  const order = ORDERS.find((o) => o.number === parsed.data.orderNumber && o.userId === user.id);
  if (!order) return { ok: false, message: "We couldn't find that order." };
  const check = await returnEligibility(order.id, order.status, order.updatedAt);
  if (!check.eligible) return { ok: false, message: check.reason ?? "This order isn't eligible for a return." };
  return demoResult();
}
