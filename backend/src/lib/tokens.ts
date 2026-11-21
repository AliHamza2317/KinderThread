import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "../modules/users/user.model.js";

/** What a sign-in token carries: who the user is, their role and the token "version". */
export type TokenPayload = { sub: string; role: Role; ver: number };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] });
}

/** Returns the payload, or null when the token is missing, expired or tampered with. */
export function readToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded !== "object" || typeof decoded.sub !== "string") return null;
    return { sub: decoded.sub, role: decoded.role as Role, ver: Number(decoded.ver ?? 0) };
  } catch {
    return null;
  }
}
