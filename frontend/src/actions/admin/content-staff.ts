"use server";

import { z } from "zod";
import { USERS } from "@/data/admin";
import { assertStaff } from "@/lib/auth";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/demo";

/*
 * Frontend-only build: staff management validates the forms and checks the
 * same rules as the real backend (no self-demotion, keep one admin), but
 * nothing is saved and there are no passwords to hash.
 */

const password = z.string().min(10, "Use at least 10 characters.").max(200);
const STAFF_ROLES = ["ADMIN", "STAFF"] as const;

function activeAdminCount(excludeId?: string) {
  return USERS.filter((u) => u.role === "ADMIN" && u.isActive && u.id !== excludeId).length;
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(80),
  email: z.email("Enter a valid email.").max(160),
  role: z.enum(STAFF_ROLES),
  password,
});

export async function createStaffAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await assertStaff({ adminOnly: true });
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  const existing = USERS.find((u) => u.email === parsed.data.email);
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
  return demoResult();
}

function loadTarget(userId: string, actorId: string) {
  const target = USERS.find((u) => u.id === userId);
  if (!target) return { error: "This account no longer exists." };
  if (target.id === actorId) return { error: "You can't change your own role or status here." };
  return { target };
}

export async function setStaffRoleAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await assertStaff({ adminOnly: true });
  const role = z.enum(["ADMIN", "STAFF", "CUSTOMER"]).safeParse(formData.get("role"));
  if (!role.success) return { ok: false, message: "Choose a role." };
  const { target, error } = loadTarget(String(formData.get("userId") ?? ""), user.id);
  if (error || !target) return { ok: false, message: error ?? "Not found" };
  if (target.role === "ADMIN" && role.data !== "ADMIN" && target.isActive && activeAdminCount(target.id) === 0) {
    return { ok: false, message: "At least one active administrator is required." };
  }
  return demoResult();
}

export async function setStaffActiveAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await assertStaff({ adminOnly: true });
  const active = formData.get("active") === "true";
  const { target, error } = loadTarget(String(formData.get("userId") ?? ""), user.id);
  if (error || !target) return { ok: false, message: error ?? "Not found" };
  if (!active && target.role === "ADMIN" && activeAdminCount(target.id) === 0) {
    return { ok: false, message: "At least one active administrator is required." };
  }
  return demoResult();
}

export async function resetStaffPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await assertStaff({ adminOnly: true });
  const pw = password.safeParse(formData.get("password"));
  if (!pw.success) return { ok: false, message: pw.error.issues[0]?.message ?? "Invalid password." };
  const { target, error } = loadTarget(String(formData.get("userId") ?? ""), user.id);
  if (error || !target) return { ok: false, message: error === "You can't change your own role or status here." ? "Use “Change my password” for your own account." : (error ?? "Not found") };
  return demoResult();
}

const changeSchema = z
  .object({ current: z.string().min(1, "Enter your current password."), next: password, confirm: z.string() })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "The new passwords don't match." })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Choose a password different from your current one." });

export async function changeMyPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await assertStaff();
  const parsed = changeSchema.safeParse({ current: formData.get("current"), next: formData.get("next"), confirm: formData.get("confirm") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  return demoResult();
}
