import { getCurrentUser, isStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSubscriberFilters, subscriberWhere } from "../query";

/** Neutralise spreadsheet formula injection and quote every cell. */
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const filters = parseSubscriberFilters(Object.fromEntries(url.searchParams));
  const rows = await db.subscriber.findMany({ where: subscriberWhere(filters), orderBy: { createdAt: "desc" }, take: 50000 });
  const lines = [
    ["email", "source", "status", "subscribed_at"].map(cell).join(","),
    ...rows.map((r) => [r.email, r.source.toLowerCase(), r.isActive ? "active" : "unsubscribed", r.createdAt.toISOString()].map(cell).join(",")),
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kinder-thread-subscribers-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
