import type { QueryFilter, Types } from "mongoose";
import type { z } from "zod";
import { notFound } from "../../lib/http-error.js";
import { skipFor, toPage } from "../../lib/pagination.js";
import { containsText } from "../../lib/text.js";
import { toPublicUser } from "../auth/auth.service.js";
import { Order } from "../orders/order.model.js";
import { User, type UserDocument } from "../users/user.model.js";
import type { customerQuery } from "./customer.validation.js";

type OrderStats = { _id: Types.ObjectId; orders: number; spent: number; lastOrderAt: Date };

/** Order count, money spent (not counting cancelled/returned orders) and last order date per customer. */
async function orderStats(userIds: Types.ObjectId[]) {
  const rows = await Order.aggregate<OrderStats>([
    { $match: { user: { $in: userIds } } },
    {
      $group: {
        _id: "$user",
        orders: { $sum: 1 },
        spent: { $sum: { $cond: [{ $in: ["$status", ["CANCELLED", "RETURNED"]] }, 0, "$total"] } },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);
  return new Map(rows.map((row) => [row._id.toString(), row]));
}

export async function listCustomers(query: z.infer<typeof customerQuery>) {
  const filter: QueryFilter<UserDocument> = { role: "CUSTOMER" };
  if (query.q) {
    const text = containsText(query.q);
    filter.$or = [{ name: text }, { email: text }, { phone: text }];
  }
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipFor(query))
      .limit(query.limit),
    User.countDocuments(filter),
  ]);
  const stats = await orderStats(users.map((u) => u._id));
  const items = users.map((user) => {
    const s = stats.get(user.id as string);
    return { ...toPublicUser(user), tags: user.tags, isActive: user.isActive, lastLoginAt: user.lastLoginAt ?? null, orders: s?.orders ?? 0, spent: s?.spent ?? 0, lastOrderAt: s?.lastOrderAt ?? null };
  });
  return toPage(items, total, query);
}

async function loadCustomer(id: string) {
  const user = await User.findOne({ _id: id, role: "CUSTOMER" });
  if (!user) throw notFound("Customer not found.");
  return user;
}

export async function getCustomer(id: string) {
  const user = await loadCustomer(id);
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).select("number status paymentStatus total createdAt");
  return { ...toPublicUser(user), tags: user.tags, isActive: user.isActive, lastLoginAt: user.lastLoginAt ?? null, addresses: user.addresses, orders };
}

export async function setTags(id: string, tags: string[]) {
  const user = await loadCustomer(id);
  user.tags = tags;
  await user.save();
  return { id: user.id as string, tags: user.tags };
}

/** Deactivated customers can't sign in, and their current sessions end. */
export async function setActive(id: string, isActive: boolean) {
  const user = await loadCustomer(id);
  user.isActive = isActive;
  if (!isActive) user.tokenVersion += 1;
  await user.save();
  return { id: user.id as string, isActive: user.isActive };
}
