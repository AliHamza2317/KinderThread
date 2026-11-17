import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export const SESSION_COOKIE = "kt_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const h = await headers();
  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, userAgent: h.get("user-agent")?.slice(0, 250) },
  });
  await db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(SESSION_COOKIE);
}

/** Current user for this request (deduplicated per request). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, phone: true, role: true, isActive: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;
  const { isActive: _ignored, ...user } = session.user;
  return user;
});

export function isStaff(user: SessionUser | null): user is SessionUser {
  return !!user && (user.role === "ADMIN" || user.role === "STAFF");
}

export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Guard for admin pages and admin server actions. STAFF may manage catalogue and orders; ADMIN everything. */
export async function requireStaff(opts: { adminOnly?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!isStaff(user)) redirect("/admin/login");
  if (opts.adminOnly && user.role !== "ADMIN") redirect("/admin?denied=1");
  return user;
}

/** Throwing variant for server actions that return results instead of redirecting. */
export async function assertStaff(opts: { adminOnly?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!isStaff(user)) throw new Error("Not authorised");
  if (opts.adminOnly && user.role !== "ADMIN") throw new Error("Only administrators can do this");
  return user;
}
