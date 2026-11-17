"use server";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { PK_PHONE_RE } from "@/lib/pk-cities";
import { normalizePhone } from "@/lib/utils";
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

async function requireAccountUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  return user;
}

/* -------------------------------------------------------------------------- */
/* login / register                                                            */
/* -------------------------------------------------------------------------- */

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").max(160),
  password: z.string().min(1, "Enter your password.").max(200),
});

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: str(formData, "email").toLowerCase(), password: formData.get("password") ?? "" });
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };

  // throttle per connection and per account to slow down password guessing
  const [perIp, perAccount] = await Promise.all([
    rateLimit("signin", 30, 10 * 60_000),
    rateLimit(`signin:${parsed.data.email}`, 8, 15 * 60_000),
  ]);
  const blocked = !perIp.ok ? perIp : !perAccount.ok ? perAccount : null;
  if (blocked) return { ok: false, message: `Too many attempts. Please try again in ${Math.max(1, Math.ceil(blocked.retryAfter / 60))} min.` };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = !!user && user.isActive && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!valid || !user) return { ok: false, message: "That email and password don't match an account." };

  await createSession(user.id);
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
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };

  // only well-formed attempts count, so typos never lock a parent out
  const limit = await rateLimit("signup", 10, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: "Too many sign-ups from this connection. Please try again in a few minutes." };

  const { name, email, phone, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, message: "An account with this email already exists.", errors: { email: ["An account with this email already exists — try signing in."] } };
  }
  const user = await db.user.create({
    data: { name, email, phone: phone ? normalizePhone(phone) : null, passwordHash: await hashPassword(password), role: "CUSTOMER" },
  });
  await createSession(user.id);
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

export async function saveAddressAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireAccountUser();
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
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  const d = parsed.data;

  if (id) {
    const owned = await db.address.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) return { ok: false, message: "That address could not be found." };
  } else {
    const count = await db.address.count({ where: { userId: user.id } });
    if (count >= 20) return { ok: false, message: "You can save up to 20 addresses." };
  }

  const data = {
    label: d.label || null,
    fullName: d.fullName,
    phone: normalizePhone(d.phone),
    city: d.city,
    line1: d.line1,
    line2: d.line2 || null,
    postalCode: d.postalCode || null,
  };

  await db.$transaction(async (tx) => {
    const hasDefault = await tx.address.count({ where: { userId: user.id, isDefault: true, ...(id ? { id: { not: id } } : {}) } });
    const makeDefault = d.isDefault || hasDefault === 0;
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    if (id) await tx.address.update({ where: { id }, data: { ...data, isDefault: makeDefault } });
    else await tx.address.create({ data: { ...data, userId: user.id, isDefault: makeDefault } });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return { ok: true, message: id ? "Address updated." : "Address saved." };
}

export async function deleteAddressAction(formData: FormData) {
  const user = await requireAccountUser();
  const id = str(formData, "id");
  const addr = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!addr) return;
  await db.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });
    if (addr.isDefault) {
      const next = await tx.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
  revalidatePath("/account/addresses");
  revalidatePath("/account");
}

export async function setDefaultAddressAction(formData: FormData) {
  const user = await requireAccountUser();
  const id = str(formData, "id");
  const addr = await db.address.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!addr) return;
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
  revalidatePath("/account");
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
  const user = await requireAccountUser();
  const parsed = profileSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email").toLowerCase(),
    phone: str(formData, "phone"),
  });
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  const { name, email, phone } = parsed.data;
  if (email !== user.email) {
    const taken = await db.user.findFirst({ where: { email, id: { not: user.id } }, select: { id: true } });
    if (taken) return { ok: false, message: "That email is already used by another account.", errors: { email: ["That email is already in use."] } };
  }
  await db.user.update({ where: { id: user.id }, data: { name, email, phone: phone ? normalizePhone(phone) : null } });
  revalidatePath("/account", "layout");
  return { ok: true, message: "Your details have been saved." };
}

const passwordSchema = z
  .object({ current: z.string().min(1, "Enter your current password."), password: passwordField, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." })
  .refine((d) => d.password !== d.current, { path: ["password"], message: "Choose a password different from your current one." });

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireAccountUser();
  const limit = await rateLimit(`password-change:${user.id}`, 6, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please try again in a few minutes." };
  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };

  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row || !(await verifyPassword(parsed.data.current, row.passwordHash))) {
    return { ok: false, message: "Your current password isn't right.", errors: { current: ["That isn't your current password."] } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });

  // sign out every other device, keep this one
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const currentHash = token ? createHash("sha256").update(token).digest("hex") : "";
  await db.session.deleteMany({ where: { userId: user.id, tokenHash: { not: currentHash } } });
  return { ok: true, message: "Password updated. Any other devices have been signed out." };
}

export async function signOutEverywhereAction() {
  const user = await requireAccountUser();
  await db.session.deleteMany({ where: { userId: user.id } });
  await destroySession();
  redirect("/account/login?signedout=1");
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
  const user = await requireAccountUser();
  const parsed = returnSchema.safeParse({
    orderNumber: str(formData, "orderNumber"),
    type: str(formData, "type"),
    reason: str(formData, "reason"),
    details: str(formData, "details"),
  });
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  const d = parsed.data;
  const order = await db.order.findFirst({ where: { number: d.orderNumber, userId: user.id }, select: { id: true, status: true, updatedAt: true, number: true } });
  if (!order) return { ok: false, message: "We couldn't find that order." };
  const check = await returnEligibility(order.id, order.status, order.updatedAt);
  if (!check.eligible) return { ok: false, message: check.reason ?? "This order isn't eligible for a return." };

  await db.$transaction([
    db.returnRequest.create({ data: { orderId: order.id, type: d.type, reason: d.reason, details: d.details || null } }),
    db.orderEvent.create({
      data: {
        orderId: order.id,
        message: `Customer requested ${d.type === "RETURN" ? "a return" : "an exchange"}: ${d.reason}`,
        isPublic: false,
        actor: "customer",
      },
    }),
  ]);
  revalidatePath(`/account/orders/${order.number}`);
  return { ok: true, message: "Thanks — we've received your request and will be in touch within 1–2 working days." };
}
