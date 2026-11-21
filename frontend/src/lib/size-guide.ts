import type { SizeGuideRow } from "./types";

export type Unit = "cm" | "in";
export type Measure = "height" | "chest" | "waist" | "length";
export const MEASURES: Measure[] = ["height", "chest", "waist", "length"];

/** "56–62" → [56, 62], "41" → [41, 41]. Accepts "-" or "–" and decimal commas. */
export function parseRange(v?: string | null): [number, number] | null {
  if (!v) return null;
  const nums = v
    .replace(/(\d),(\d)/g, "$1.$2")
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number);
  if (!nums?.length) return null;
  return [nums[0], nums[nums.length - 1]];
}

const round = (n: number, step = 0.5) => Math.round(n / step) * step;
const fmt = (n: number) => String(round(n));

export function toCm(n: number, from: string) {
  return from === "in" ? n * 2.54 : n;
}

/** A stored measurement shown in the chosen unit ("56–62" cm → "22–24.5" in). */
export function showMeasure(v: string | undefined, from: string, to: Unit): string {
  if (!v) return "—";
  const r = parseRange(v);
  if (!r || from === to) return v.replace(/(\d)\s*-\s*(\d)/g, "$1–$2");
  const k = to === "in" ? 1 / 2.54 : 2.54;
  const [a, b] = [r[0] * k, r[1] * k];
  return a === b ? fmt(a) : `${fmt(a)}–${fmt(b)}`;
}

/** A height in centimetres shown in the chosen unit, e.g. "86 cm" or "33.9 in". */
export function showHeight(cm: number, unit: Unit) {
  return unit === "in" ? `${(Math.round((cm / 2.54) * 10) / 10).toFixed(1)}` : `${Math.round(cm)}`;
}

export type HeightBounds = { min: number; max: number };

/** The height scale (in cm) the fit finder offers for a guide, a little wider than the chart. */
export function heightBounds(rows: SizeGuideRow[], unit: string): HeightBounds | null {
  const all = rows.map((r) => parseRange(r.height)).filter(Boolean) as [number, number][];
  if (!all.length) return null;
  const lo = Math.min(...all.map((r) => r[0]));
  const hi = Math.max(...all.map((r) => r[1]));
  return { min: Math.floor(toCm(lo, unit) / 2) * 2 - 4, max: Math.ceil(toCm(hi, unit) / 2) * 2 + 4 };
}

export type Fit = {
  row: SizeGuideRow;
  /** where the height sits: below the smallest size, inside one, or above the largest */
  place: "below" | "within" | "above";
  /** inside the size but within 1.5 cm of its top — worth sizing up */
  nearTop: boolean;
};

/**
 * The size for a child's height (in cm). Heights on a boundary between two sizes get the
 * larger one, as little ones grow quickly.
 */
export function findFit(rows: SizeGuideRow[], heightCm: number, unit: string): Fit | null {
  const sized = rows.map((row) => ({ row, r: parseRange(row.height) })).filter((x): x is { row: SizeGuideRow; r: [number, number] } => !!x.r);
  if (!sized.length) return null;
  const cm = (n: number) => toCm(n, unit);
  const first = sized[0];
  const last = sized[sized.length - 1];
  if (heightCm < cm(first.r[0])) return { row: first.row, place: "below", nearTop: false };
  if (heightCm > cm(last.r[1])) return { row: last.row, place: "above", nearTop: false };
  const i = sized.findIndex((x) => heightCm < cm(x.r[1]));
  const hit = i === -1 ? last : sized[i];
  const hasNext = i !== -1 && i < sized.length - 1;
  return { row: hit.row, place: "within", nearTop: hasNext && cm(hit.r[1]) - heightCm <= 1.5 };
}
