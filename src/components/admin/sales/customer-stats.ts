import "server-only";
import { db } from "@/lib/db";
import { segmentFor, type Segment } from "./labels";

export type CustomerStats = { orders: number; spend: number; lastOrder: Date | null; segment: Segment };

/** Order count, spend and last order for the given users (cancelled orders excluded). */
export async function statsForUsers(userIds: string[]) {
  const map = new Map<string, CustomerStats>();
  if (!userIds.length) return map;
  const rows = await db.order.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, status: { not: "CANCELLED" } },
    _count: { _all: true },
    _sum: { total: true },
    _max: { createdAt: true },
  });
  for (const r of rows) {
    if (!r.userId) continue;
    const orders = r._count._all;
    const spend = r._sum.total ?? 0;
    const lastOrder = r._max.createdAt ?? null;
    map.set(r.userId, { orders, spend, lastOrder, segment: segmentFor(orders, spend, lastOrder) });
  }
  for (const id of userIds) if (!map.has(id)) map.set(id, { orders: 0, spend: 0, lastOrder: null, segment: "PROSPECT" });
  return map;
}
