import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Simple per-IP limits for endpoints that attract abuse (password guessing, spam orders).
 * Counts are kept in memory per server instance — enough to slow down bots; use a shared
 * store (e.g. Redis) if you need exact limits across many instances.
 */
const limiter = (windowMinutes: number, limit: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { message },
  });

export const authLimiter = limiter(15, 20, "Too many sign-in attempts. Please wait a few minutes and try again.");
export const checkoutLimiter = limiter(10, 15, "Too many orders from this connection. Please wait a few minutes.");
export const formLimiter = limiter(10, 30, "Too many requests. Please wait a few minutes and try again.");
