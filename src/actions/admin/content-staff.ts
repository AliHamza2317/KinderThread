"use server";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertStaff, hashPassword, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, type ActionResult } from "@/lib/action-result";

const password = z.string().min(10, "Use at least 10 characters.").max(200);
const STAFF_ROLES = ["ADMIN", "STAFF"] as const;

async function guardAdmin() {
  try {
    return { user: await assertStaff({ adminOnly: true }) };
  } catch (e) {
    return { error: { ok: false as const, message: e instanceof Error ? e.message : "Not authorised" } };
  }
}

async function activeAdminCount(excludeId?: string) {
  return db.user.count({ where: { role: "ADMIN", isActive: true, ...(excludeId ? { id: { not: excludeId } } : {}) } });
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(80),
  email: z.email("Enter a valid email.").max(160),
  role: z.enum(STAFF_ROLES),
  password,
});

export async function createStaffAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const g = await guardAdmin();
  if (g.error) return g.error;
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  const { name, email, role } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing) {
    return {
      ok: false,
      message:
        existing.role === "CUSTOMER"
          ? "A customer account already uses this email. Use a different email for the staff account."
          : "A staff account with this email already exists.",
      errors: { email: ["Already in use"] },
    };
  }
  await db.user.create({ data: { name, email, role, passwordHash: await hashPassword(parsed.data.password) } });
  revalidatePath("/admin/staff");
  return { ok: true, message: `${name} can now sign in at /admin/login. Share the temporary password privately and ask them to change it.` };
}

async function loadTarget(userId: string, actorId: string) {
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "This account no longer exists." };
  if (target.id === actorId) return { error: "You can't change your own role or status here." };
  return { target };
}

export async function setStaffRoleAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const g = await guardAdmin();
  if (g.error) return g.error;
  const role = z.enum(["ADMIN", "STAFF", "CUSTOMER"]).safeParse(formData.get("role"));
  if (!role.success) return { ok: false, message: "Choose a role." };
  const { target, error } = await loadTarget(String(formData.get("userId") ?? ""), g.user.id);
  if (error || !target) return { ok: false, message: error ?? "Not found" };
  if (target.role === "ADMIN" && role.data !== "ADMIN" && target.isActive && (await activeAdminCount(target.id)) === 0) {
    return { ok: false, message: "At least one active administrator is required." };
  }
  await db.$transaction([
    db.user.update({ where: { id: target.id }, data: { role: role.data } }),
    // a role change forces a fresh sign-in
    db.session.deleteMany({ where: { userId: target.id } }),
  ]);
  revalidatePath("/admin/staff");
  return {
    ok: true,
    message: role.data === "CUSTOMER" ? `${target.name} no longer has admin access.` : `${target.name} is now ${role.data === "ADMIN" ? "an administrator" : "staff"}.`,
  };
}

export async function setStaffActiveAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const g = await guardAdmin();
  if (g.error) return g.error;
  const active = formData.get("active") === "true";
  const { target, error } = await loadTarget(String(formData.get("userId") ?? ""), g.user.id);
  if (error || !target) return { ok: false, message: error ?? "Not found" };
  if (!active && target.role === "ADMIN" && (await activeAdminCount(target.id)) === 0) {
    return { ok: false, message: "At least one active administrator is required." };
  }
  await db.$transaction([
    db.user.update({ where: { id: target.id }, data: { isActive: active } }),
    ...(active ? [] : [db.session.deleteMany({ where: { userId: target.id } })]),
  ]);
  revalidatePath("/admin/staff");
  return { ok: true, message: active ? `${target.name} has been reactivated.` : `${target.name} has been deactivated and signed out.` };
}

export async function resetStaffPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const g = await guardAdmin();
  if (g.error) return g.error;
  const pw = password.safeParse(formData.get("password"));
  if (!pw.success) return { ok: false, message: pw.error.issues[0]?.message ?? "Invalid password." };
  const { target, error } = await loadTarget(String(formData.get("userId") ?? ""), g.user.id);
  if (error || !target) return { ok: false, message: error === "You can't change your own role or status here." ? "Use “Change my password” for your own account." : (error ?? "Not found") };
  await db.$transaction([
    db.user.update({ where: { id: target.id }, data: { passwordHash: await hashPassword(pw.data) } }),
    db.session.deleteMany({ where: { userId: target.id } }),
  ]);
  return { ok: true, message: `Password reset. ${target.name} has been signed out everywhere.` };
}

const changeSchema = z
  .object({ current: z.string().min(1, "Enter your current password."), next: password, confirm: z.string() })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "The new passwords don't match." })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Choose a password different from your current one." });

export async function changeMyPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await assertStaff();
  } catch {
    return { ok: false, message: "Not authorised" };
  }
  const limit = await rateLimit("change-password", 6, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please wait a few minutes." };
  const parsed = changeSchema.safeParse({ current: formData.get("current"), next: formData.get("next"), confirm: formData.get("confirm") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  const row = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!row || !(await verifyPassword(parsed.data.current, row.passwordHash))) {
    return { ok: false, message: "Your current password is incorrect.", errors: { current: ["Incorrect password"] } };
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const currentHash = token ? createHash("sha256").update(token).digest("hex") : "";
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } }),
    // sign out every other device, keep this one
    db.session.deleteMany({ where: { userId: user.id, tokenHash: { not: currentHash } } }),
  ]);
  return { ok: true, message: "Password updated. Other devices have been signed out." };
}
