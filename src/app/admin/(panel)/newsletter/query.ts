import type { Prisma, SubscriberSource } from "@/generated/prisma/client";

export const SOURCES: { id: SubscriberSource; label: string }[] = [
  { id: "NEWSLETTER", label: "Newsletter" },
  { id: "LAUNCH", label: "Launch list" },
  { id: "TRYON", label: "Try-on interest" },
  { id: "CHECKOUT", label: "Checkout opt-in" },
];

export type SubscriberFilters = { source?: SubscriberSource; status?: "active" | "inactive"; q?: string };

export function parseSubscriberFilters(sp: Record<string, string | string[] | undefined>): SubscriberFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) || undefined;
  const source = one("source");
  const status = one("status");
  return {
    source: SOURCES.some((s) => s.id === source) ? (source as SubscriberSource) : undefined,
    status: status === "active" || status === "inactive" ? status : undefined,
    q: one("q")?.trim().slice(0, 100) || undefined,
  };
}

export function subscriberWhere(f: SubscriberFilters): Prisma.SubscriberWhereInput {
  return {
    ...(f.source ? { source: f.source } : {}),
    ...(f.status ? { isActive: f.status === "active" } : {}),
    ...(f.q ? { email: { contains: f.q, mode: "insensitive" } } : {}),
  };
}

export function filterQuery(f: SubscriberFilters, extra: Record<string, string> = {}) {
  const p = new URLSearchParams();
  if (f.source) p.set("source", f.source);
  if (f.status) p.set("status", f.status);
  if (f.q) p.set("q", f.q);
  for (const [k, v] of Object.entries(extra)) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}
