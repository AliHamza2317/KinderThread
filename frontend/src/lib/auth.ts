import { DEMO_CUSTOMER, STAFF } from "@/data/admin";
import type { Role } from "@/lib/types";

/**
 * Frontend-only build: there is no login backend yet. The account area shows a
 * demo customer and the admin area a demo administrator, using dummy data.
 */
export type SessionUser = { id: string; email: string; name: string; phone: string | null; role: Role };

const toSession = (u: { id: string; email: string; name: string; phone: string | null; role: Role }): SessionUser => ({ id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role });

export const DEMO_ADMIN: SessionUser = toSession(STAFF[0]);
export const DEMO_USER: SessionUser = toSession(DEMO_CUSTOMER);

/** Storefront visitors are guests until real accounts exist. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return null;
}

export function isStaff(user: SessionUser | null): user is SessionUser {
  return !!user && (user.role === "ADMIN" || user.role === "STAFF");
}

/** Account pages show the demo customer. */
export async function requireUser(_next = "/account"): Promise<SessionUser> {
  return DEMO_USER;
}

/** Admin pages show the demo administrator. */
export async function requireStaff(_opts: { adminOnly?: boolean } = {}): Promise<SessionUser> {
  return DEMO_ADMIN;
}

export async function assertStaff(_opts: { adminOnly?: boolean } = {}): Promise<SessionUser> {
  return DEMO_ADMIN;
}
