/** A page of results, as every list endpoint returns it. */
export type Page<T> = { items: T[]; total: number; page: number; pages: number };

/** How many documents to skip for ?page=&limit= (both already validated). */
export const skipFor = ({ page, limit }: { page: number; limit: number }) => (page - 1) * limit;

export function toPage<T>(items: T[], total: number, { page, limit }: { page: number; limit: number }): Page<T> {
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}
