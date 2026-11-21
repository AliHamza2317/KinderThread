/** "Baby Girls' Dresses!" → "baby-girls-dresses" */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Makes user text safe to use inside a RegExp (for case-insensitive search). */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** "  Hello " → /hello/i, matching anywhere in a field. */
export const containsText = (value: string) => new RegExp(escapeRegex(value.trim()), "i");
