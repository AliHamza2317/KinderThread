/** Canonical size ladder for ages 0–5. Order matters (used for sorting). */
export const SIZES = ["0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2-3Y", "3-4Y", "4-5Y"] as const;

export const SIZE_LABELS: Record<string, string> = {
  "0-3M": "0–3 months",
  "3-6M": "3–6 months",
  "6-9M": "6–9 months",
  "9-12M": "9–12 months",
  "12-18M": "12–18 months",
  "18-24M": "18–24 months",
  "2-3Y": "2–3 years",
  "3-4Y": "3–4 years",
  "4-5Y": "4–5 years",
};

/** Coarse age groups used by the shop filter */
export const AGE_GROUPS = [
  { id: "newborn", label: "Newborn · 0–6M", sizes: ["0-3M", "3-6M"] },
  { id: "baby", label: "Baby · 6–12M", sizes: ["6-9M", "9-12M"] },
  { id: "toddler", label: "Toddler · 1–2Y", sizes: ["12-18M", "18-24M"] },
  { id: "little", label: "Little ones · 2–5Y", sizes: ["2-3Y", "3-4Y", "4-5Y"] },
] as const;

export function sortSizes<T extends string>(sizes: T[]): T[] {
  const idx = (s: string) => {
    const i = (SIZES as readonly string[]).indexOf(s);
    return i === -1 ? 999 : i;
  };
  return [...sizes].sort((a, b) => idx(a) - idx(b) || a.localeCompare(b));
}

export function sizeLabel(size: string) {
  return SIZE_LABELS[size] ?? size;
}
