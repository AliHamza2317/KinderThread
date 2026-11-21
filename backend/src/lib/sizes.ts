/** The size ladder for ages 0–5, smallest first (used for sorting). */
export const SIZES = ["0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2-3Y", "3-4Y", "4-5Y"] as const;

/** Age groups used by the shop filter (?age=baby). */
export const AGE_GROUPS: Record<string, readonly string[]> = {
  newborn: ["0-3M", "3-6M"],
  baby: ["6-9M", "9-12M"],
  toddler: ["12-18M", "18-24M"],
  little: ["2-3Y", "3-4Y", "4-5Y"],
};

const position = (size: string) => {
  const index = (SIZES as readonly string[]).indexOf(size);
  return index === -1 ? SIZES.length : index;
};

export function sortSizes(sizes: Iterable<string>): string[] {
  return [...new Set(sizes)].sort((a, b) => position(a) - position(b) || a.localeCompare(b));
}
