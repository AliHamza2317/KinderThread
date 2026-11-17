import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "kt_orders";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") console.warn("[kinder-thread] AUTH_SECRET is not set — using a derived fallback. Set AUTH_SECRET in production.");
  return createHash("sha256").update(`kt-fallback:${process.env.DATABASE_URL ?? ""}`).digest("hex");
}

const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

/** Remember that this browser placed an order, so it may view the confirmation page. */
export async function grantOrderAccess(orderNumber: string) {
  const jar = await cookies();
  const current = await readAccess();
  const list = [orderNumber, ...current.filter((n) => n !== orderNumber)].slice(0, 10);
  const value = list.join(".");
  jar.set(COOKIE, `${value}~${sign(value)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

async function readAccess(): Promise<string[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  const [value, mac] = raw.split("~");
  if (!value || !mac) return [];
  const expected = Buffer.from(sign(value));
  const got = Buffer.from(mac);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return [];
  return value.split(".");
}

export async function hasOrderAccess(orderNumber: string) {
  return (await readAccess()).includes(orderNumber);
}
