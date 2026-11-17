import "server-only";
import { headers } from "next/headers";

/**
 * Small in-memory sliding-window limiter. Good enough for a single Node
 * instance; swap for Redis/Upstash when running multiple instances.
 */
const buckets = new Map<string, number[]>();

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const id = `${key}:${await clientIp()}`;
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(id, hits);
    return { ok: false as const, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(id, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true as const };
}
