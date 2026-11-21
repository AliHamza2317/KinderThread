import { z } from "zod";

/** A page of results, as every list endpoint returns it. */
export type Page<T> = { items: T[]; total: number; page: number; pages: number };

/**
 * ?page=&limit= fields to spread into a query schema. Every list uses the same rule;
 * only the default page size changes (the shop grid shows 24, admin tables 25).
 */
export const paging = (defaultLimit = 25) => ({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(defaultLimit),
});

/** How many documents to skip for the page asked for. */
export const skipFor = ({ page, limit }: { page: number; limit: number }) => (page - 1) * limit;

export function toPage<T>(items: T[], total: number, { page, limit }: { page: number; limit: number }): Page<T> {
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}
