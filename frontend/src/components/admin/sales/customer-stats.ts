import { ORDERS } from "@/data/admin";
import { segmentFor, type Segment } from "./labels";

export type CustomerStats = { orders: number; spend: number; lastOrder: Date | null; segment: Segment };

/** Order count, spend and last order for the given users (cancelled orders excluded). */
export async function statsForUsers(userIds: string[]) {
  const map = new Map<string, CustomerStats>();
  for (const id of userIds) {
    const orders = ORDERS.filter((o) => o.userId === id && o.status !== "CANCELLED");
    const spend = orders.reduce((s, o) => s + o.total, 0);
    const lastOrder = orders.reduce<Date | null>((d, o) => (!d || o.createdAt > d ? o.createdAt : d), null);
    map.set(id, { orders: orders.length, spend, lastOrder, segment: segmentFor(orders.length, spend, lastOrder) });
  }
  return map;
}
