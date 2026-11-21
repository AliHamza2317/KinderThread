import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../lib/http-error.js";
import { readToken } from "../lib/tokens.js";
import { User, isStaffRole, type Role } from "../modules/users/user.model.js";

/** The signed-in user attached to `req.user` by the middleware below. */
export type AuthUser = { id: string; name: string; email: string; role: Role };

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : null;
}

/**
 * Checks the token and that the account still exists, is active and hasn't signed out
 * everywhere since the token was issued (one small database read per request).
 */
async function authenticate(token: string): Promise<AuthUser> {
  const payload = readToken(token);
  if (!payload) throw unauthorized("Your session has expired. Please sign in again.");

  const user = await User.findById(payload.sub).select("name email role isActive tokenVersion");
  if (!user || !user.isActive || user.tokenVersion !== payload.ver) {
    throw unauthorized("Your session has expired. Please sign in again.");
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** Route needs a signed-in user (customer or staff). */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) throw unauthorized();
  req.user = await authenticate(token);
  next();
}

/**
 * Signed-in user is optional (checkout links the order to the account when there is one).
 * An expired or invalid token simply counts as a guest, so it never blocks an order.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (token) req.user = await authenticate(token).catch(() => undefined);
  next();
}

/** Staff or admin only. Use after requireAuth. */
export function requireStaff(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || !isStaffRole(req.user.role)) throw forbidden("This area is for store staff only.");
  next();
}

/** Admin only (e.g. managing staff accounts). Use after requireAuth. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") throw forbidden("Only an administrator can do that.");
  next();
}

/** The current user inside a handler protected by requireAuth. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}
