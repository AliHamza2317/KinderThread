"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";

export async function logoutAction(formData?: FormData) {
  await destroySession();
  const to = String(formData?.get("redirectTo") ?? "/");
  redirect(to.startsWith("/") && !to.startsWith("//") ? to : "/");
}

const loginSchema = z.object({ email: z.email().max(160), password: z.string().min(1).max(200) });

export async function adminLoginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const limit = await rateLimit("admin-login", 8, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} min.` };
  const parsed = loginSchema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase(), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Enter your email and password." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && user.isActive && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!valid || !user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    return { ok: false, message: "Those details don't match a staff account." };
  }
  await createSession(user.id);
  redirect("/admin");
}
