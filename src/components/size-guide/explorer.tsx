"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SizeGuideRow } from "@/lib/types";
import { AGE_GROUPS, sizeLabel } from "@/lib/sizes";
import { findFit, heightBounds, parseRange, showHeight, showMeasure, toCm, type Fit, type Measure, type Unit } from "@/lib/size-guide";
import { cn } from "@/lib/utils";
import { HOW_TO_MEASURE, MeasureFigure } from "./measure-figure";

export type GuideData = { name: string; unit: string; rows: SizeGuideRow[]; notes: string | null };

/** "2-3Y" → "2–3Y" */
export const prettySize = (s: string) => s.replace(/(\d)-(\d)/, "$1–$2");

type Group = { id: string; name: string; range: string; sizes: readonly string[] };

type Ctx = {
  guide: GuideData;
  unit: Unit;
  setUnit: (u: Unit) => void;
  height: number;
  setHeight: (cm: number) => void;
  touched: boolean;
  fit: Fit | null;
  groups: Group[];
  group: string;
  setGroup: (g: string) => void;
};

const SizeGuideCtx = createContext<Ctx | null>(null);

function useGuide() {
  const c = useContext(SizeGuideCtx);
  if (!c) throw new Error("Size guide parts must sit inside <SizeGuideProvider>");
  return c;
}

/** Shares the unit, the fit-finder height and the age tab between the finder and the chart. */
export function SizeGuideProvider({ guide, children }: { guide: GuideData; children: ReactNode }) {
  const bounds = heightBounds(guide.rows, guide.unit);
  const groups = useMemo<Group[]>(
    () =>
      AGE_GROUPS.map((g): Group => {
        const [name, range] = g.label.split(" · ");
        return { id: g.id, name, range, sizes: g.sizes };
      }).filter((g) => guide.rows.some((r) => g.sizes.includes(r.size))),
    [guide.rows],
  );
  const [unit, setUnit] = useState<Unit>(guide.unit === "in" ? "in" : "cm");
  const [height, setHeightRaw] = useState(() => (bounds ? Math.round((bounds.min + bounds.max) / 2) : 0));
  const [touched, setTouched] = useState(false);
  const [group, setGroup] = useState("all");
  const fit = bounds ? findFit(guide.rows, height, guide.unit) : null;

  const setHeight = (cm: number) => {
    if (!bounds) return;
    const next = Math.min(bounds.max, Math.max(bounds.min, Math.round(cm * 100) / 100));
    setHeightRaw(next);
    setTouched(true);
    // keep the chart showing the size the finder points at
    const f = findFit(guide.rows, next, guide.unit);
    if (f && group !== "all" && !groups.find((g) => g.id === group)?.sizes.includes(f.row.size)) {
      setGroup(groups.find((g) => g.sizes.includes(f.row.size))?.id ?? "all");
    }
  };

  return <SizeGuideCtx.Provider value={{ guide, unit, setUnit, height, setHeight, touched, fit, groups, group, setGroup }}>{children}</SizeGuideCtx.Provider>;
}

/** cm | in */
export function UnitToggle({ className }: { className?: string }) {
  const { unit, setUnit } = useGuide();
  return (
    <div role="radiogroup" aria-label="Units" className={cn("inline-flex shrink-0 rounded-full bg-cream-100 p-1 text-[0.8rem] font-semibold", className)}>
      {(["cm", "in"] as const).map((u) => (
        <button
          key={u}
          type="button"
          role="radio"
          aria-checked={unit === u}
          onClick={() => setUnit(u)}
          className={cn("h-8 min-w-11 rounded-full px-3 transition-colors", unit === u ? "bg-cocoa text-cream-50 shadow-sm" : "text-cocoa-500 hover:text-cocoa")}
        >
          {u}
        </button>
      ))}
    </div>
  );
}

function fitHint(fit: Fit, rows: SizeGuideRow[], compact: boolean) {
  const i = rows.findIndex((r) => r.size === fit.row.size);
  const next = rows[i + 1];
  if (fit.place === "below") return compact ? `Smaller than the first size here — ${prettySize(fit.row.size)} will be roomy.` : `Smaller than our first size — ${prettySize(fit.row.size)} will have room to grow.`;
  if (fit.place === "above") return compact ? `Taller than the largest size here — ${prettySize(fit.row.size)} may feel snug.` : `Taller than our largest size — ${prettySize(fit.row.size)} may feel snug.`;
  if (fit.nearTop && next) return `Near the top of this size — choose ${prettySize(next.size)} for longer wear.`;
  return "A comfy fit with a little room to grow.";
}

/**
 * "How tall is your little one?" — a height slider that names the size to choose.
 * `onChoose` (product page) picks that size; otherwise it links to the shop filtered by size.
 */
export function FitFinder({ variant = "hero", onChoose, className }: { variant?: "hero" | "compact"; onChoose?: (size: string) => void; className?: string }) {
  const { guide, unit, height, setHeight, fit } = useGuide();
  const bounds = heightBounds(guide.rows, guide.unit);
  if (!bounds || !fit) return null;
  const compact = variant === "compact";
  const pct = ((height - bounds.min) / (bounds.max - bounds.min)) * 100;
  const range = parseRange(fit.row.height);
  const rangeText = range ? showMeasure(fit.row.height, guide.unit, unit) : null;
  const step = unit === "in" ? 1.27 : 1;

  return (
    <div className={cn(compact ? "rounded-[1.5rem] bg-white p-5 ring-1 ring-cocoa/[0.06]" : "rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-cocoa/[0.05] sm:p-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-sage-700 uppercase">Fit finder</p>
          <h2 className={cn("mt-1.5 tracking-[-0.02em] text-cocoa", compact ? "text-[1.05rem] font-semibold" : "font-display text-[1.6rem] leading-tight font-medium sm:text-[1.85rem]")}>
            How tall is your little one?
          </h2>
        </div>
        {!compact && <UnitToggle />}
      </div>

      {/* value with − / + */}
      <div className={cn("flex items-center justify-between", compact ? "mt-4" : "mt-7")}>
        <button type="button" onClick={() => setHeight(height - step)} disabled={height <= bounds.min} aria-label="Shorter" className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/12 text-cocoa transition hover:border-cocoa disabled:opacity-35">
          <Minus className="h-4 w-4" />
        </button>
        <p className="text-center tabular-nums" aria-live="polite">
          <span className={cn("font-display font-medium tracking-[-0.04em] text-cocoa", compact ? "text-[2.4rem]" : "text-[3.4rem] sm:text-[4rem]")}>{showHeight(height, unit)}</span>
          <span className="ml-1.5 text-[1rem] font-medium text-cocoa-400">{unit}</span>
        </p>
        <button type="button" onClick={() => setHeight(height + step)} disabled={height >= bounds.max} aria-label="Taller" className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/12 text-cocoa transition hover:border-cocoa disabled:opacity-35">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <input
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={step}
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
        aria-label="Child's height"
        aria-valuetext={`${showHeight(height, unit)} ${unit === "in" ? "inches" : "centimetres"}`}
        className="kt-range mt-4 w-full"
        style={{ ["--p" as string]: `${pct}%` }}
      />
      <div className="mt-1.5 flex justify-between text-[0.72rem] text-cocoa-400 tabular-nums">
        <span>
          {showHeight(bounds.min, unit)} {unit}
        </span>
        <span>
          {showHeight(bounds.max, unit)} {unit}
        </span>
      </div>

      {/* result */}
      <div className={cn("flex items-center gap-4 rounded-[1.25rem] bg-sage-50 ring-1 ring-sage-100", compact ? "mt-4 p-3.5" : "mt-6 p-4 sm:p-5")}>
        <span className={cn("grid shrink-0 place-items-center rounded-full bg-white font-display font-semibold tracking-[-0.03em] text-sage-800 shadow-[0_6px_16px_-10px_rgb(20_16_12/0.5)]", compact ? "h-14 w-14 text-[1.05rem]" : "h-16 w-16 text-[1.1rem] sm:h-[4.5rem] sm:w-[4.5rem] sm:text-[1.25rem]")}>
          {prettySize(fit.row.size)}
        </span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-sage-700 uppercase">Your size</p>
          <p className="mt-0.5 text-[1.02rem] font-semibold text-cocoa">
            {sizeLabel(fit.row.size)}
            {rangeText && (
              <span className="text-[0.85rem] font-normal whitespace-nowrap text-cocoa-500 max-sm:block sm:ml-1.5">
                <span className="max-sm:hidden">· </span>
                {rangeText} {unit} tall
              </span>
            )}
          </p>
          <p className="mt-0.5 text-[0.84rem] leading-snug text-cocoa-500">{fitHint(fit, guide.rows, compact)}</p>
        </div>
      </div>

      {onChoose ? (
        <button type="button" onClick={() => onChoose(fit.row.size)} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cocoa text-[0.92rem] font-semibold text-cream-50 transition hover:bg-cocoa-800">
          Choose {prettySize(fit.row.size)}
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <Link href={`/shop?size=${encodeURIComponent(fit.row.size)}`} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cocoa text-[0.92rem] font-semibold text-cream-50 transition hover:bg-cocoa-800">
          Shop size {prettySize(fit.row.size)}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      {!compact && <p className="mt-3 text-center text-[0.75rem] text-cocoa-400">A guide only — when in doubt, size up.</p>}
    </div>
  );
}

const COL_LABEL: Record<Measure | "age", string> = { age: "Age", height: "Height", chest: "Chest", waist: "Waist", length: "Length" };

/** The chart: age tabs, cm/in, and the finder's size (or the chosen size) marked. */
export function SizeChart({ highlight, showGroups = true, compact = false, className }: { highlight?: string | null; showGroups?: boolean; compact?: boolean; className?: string }) {
  const { guide, unit, groups, group, setGroup, fit, touched } = useGuide();
  const cols = (["height", "chest", "waist", "length"] as const).filter((c) => guide.rows.some((r) => r[c]));
  const hasAge = guide.rows.some((r) => r.age);
  const active = groups.find((g) => g.id === group);
  const rows = active ? guide.rows.filter((r) => active.sizes.includes(r.size)) : guide.rows;
  const fitSize = touched ? fit?.row.size : null;

  return (
    <div className={cn("overflow-hidden bg-white", compact ? "rounded-[1.5rem] ring-1 ring-cocoa/[0.06]" : "rounded-[2rem] shadow-soft ring-1 ring-cocoa/[0.05]", className)}>
      {(showGroups && groups.length > 1) || !compact ? (
        <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-cocoa/[0.06]", compact ? "p-3" : "p-4 sm:p-5")}>
          {showGroups && groups.length > 1 ? (
            <div role="tablist" aria-label="Age" className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]">
              {[{ id: "all", name: "All sizes", range: "" }, ...groups].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={group === g.id}
                  onClick={() => setGroup(g.id)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[0.82rem] font-semibold whitespace-nowrap transition-colors",
                    group === g.id ? "bg-sage-700 text-cream-50" : "bg-cream-50 text-cocoa-600 ring-1 ring-cocoa/[0.08] hover:text-cocoa hover:ring-cocoa/20",
                  )}
                >
                  {g.name}
                  {g.range && !compact && <span className={cn("font-medium", group === g.id ? "text-cream-50/70" : "text-cocoa-400")}>{g.range}</span>}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          {!compact && <UnitToggle />}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <caption className="sr-only">
            {guide.name} — measurements in {unit === "in" ? "inches" : "centimetres"}
          </caption>
          <thead>
            <tr className="bg-cream-50/80 text-[0.68rem] tracking-[0.12em] text-cocoa-400 uppercase">
              <th scope="col" className={cn("font-semibold", compact ? "py-3 pr-2 pl-4" : "py-3.5 pr-2 pl-4 sm:pr-3 sm:pl-7")}>
                Size
              </th>
              {hasAge && (
                <th scope="col" className={cn("hidden py-3.5 pr-3 font-semibold", !compact && "sm:table-cell")}>
                  {COL_LABEL.age}
                </th>
              )}
              {cols.map((c, i) => (
                <th key={c} scope="col" className={cn("py-3.5 pr-2 font-semibold sm:pr-3", i === cols.length - 1 && (compact ? "pr-4" : "pr-4 sm:pr-7"))}>
                  {COL_LABEL[c]}
                  <span className={cn("ml-1 tracking-normal normal-case", compact ? "hidden" : "max-sm:hidden")}>({unit})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isFit = r.size === fitSize;
              const isSel = r.size === highlight;
              return (
                <tr
                  key={r.size}
                  className={cn(
                    "border-t border-cocoa/[0.06] text-[0.86rem] tabular-nums transition-colors sm:text-[0.9rem]",
                    isFit ? "bg-sage-50 shadow-[inset_3px_0_0_var(--color-sage-600)]" : isSel ? "bg-sun-50 shadow-[inset_3px_0_0_var(--color-sun-600)]" : "hover:bg-cream-50/70",
                  )}
                >
                  <th scope="row" className={cn("text-left align-middle font-semibold text-cocoa", compact ? "py-3 pr-2 pl-4" : "py-3.5 pr-2 pl-4 sm:py-4 sm:pr-3 sm:pl-7")}>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="whitespace-nowrap">{prettySize(r.size)}</span>
                      {isFit && <span className="rounded-full bg-sage-700 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.08em] text-cream-50 uppercase">Your fit</span>}
                      {isSel && !isFit && <span className="rounded-full bg-sun-200 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.08em] text-cocoa uppercase">Selected</span>}
                    </span>
                    {hasAge && <span className={cn("mt-0.5 block text-[0.75rem] font-normal whitespace-nowrap text-cocoa-400", !compact && "sm:hidden")}>{r.age || sizeLabel(r.size)}</span>}
                  </th>
                  {hasAge && <td className={cn("hidden py-4 pr-3 text-cocoa-600", !compact && "sm:table-cell")}>{r.age || "—"}</td>}
                  {cols.map((c, i) => (
                    <td key={c} className={cn("pr-2 whitespace-nowrap sm:pr-3", c === "height" ? "font-semibold text-cocoa" : "text-cocoa-600", compact ? "py-3" : "py-3.5 sm:py-4", i === cols.length - 1 && (compact ? "pr-4" : "pr-4 sm:pr-7"))}>
                      {showMeasure(r[c], guide.unit, unit)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * A wall growth chart beside the fit finder: a height scale with each size as a band.
 * The marker follows the slider; tapping a band jumps to that size.
 */
export function GrowthRuler({ className }: { className?: string }) {
  const { guide, unit, height, setHeight, fit } = useGuide();
  const bounds = heightBounds(guide.rows, guide.unit);
  if (!bounds) return null;
  const span = bounds.max - bounds.min;
  const at = (cm: number) => `${((cm - bounds.min) / span) * 100}%`;
  const bands = guide.rows.flatMap((r) => {
    const h = parseRange(r.height);
    return h ? [{ size: r.size, lo: toCm(h[0], guide.unit), hi: toCm(h[1], guide.unit) }] : [];
  });
  const k = unit === "in" ? 2.54 : 1;
  const [minor, major] = unit === "in" ? [1, 5] : [2, 10];
  const ticks: { cm: number; v: number; major: boolean }[] = [];
  for (let v = Math.ceil(bounds.min / k / minor) * minor; v * k <= bounds.max; v += minor) ticks.push({ cm: v * k, v, major: v % major === 0 });

  return (
    <div className={cn("relative h-[31rem] w-[10.5rem] rounded-[1.75rem] bg-cream-50/90 shadow-soft ring-1 ring-cocoa/[0.05]", className)}>
      <div className="absolute inset-x-0 top-5 bottom-5">
        {/* scale */}
        <div aria-hidden>
          {ticks.map((t) => (
            <div key={t.v} className="absolute left-0 flex w-12 items-center justify-end gap-1.5" style={{ bottom: at(t.cm), transform: "translateY(50%)" }}>
              {t.major && <span className="text-[0.62rem] font-medium text-cocoa-400 tabular-nums">{t.v}</span>}
              <span className={cn("h-px bg-cocoa/25", t.major ? "w-3.5" : "w-2")} />
            </div>
          ))}
        </div>
        {/* sizes */}
        {bands.map((b) => {
          const on = fit?.row.size === b.size;
          return (
            <button
              key={b.size}
              type="button"
              onClick={() => setHeight((b.lo + b.hi) / 2)}
              aria-label={`Size ${prettySize(b.size)}, ${showMeasure(guide.rows.find((r) => r.size === b.size)?.height, guide.unit, unit)} ${unit}`}
              className={cn(
                "absolute right-3 left-14 flex items-center justify-center rounded-[0.6rem] text-[0.72rem] font-semibold transition-colors duration-300",
                on ? "bg-sage-700 text-cream-50" : "bg-sage-50 text-cocoa-500 hover:bg-sage-100 hover:text-cocoa",
              )}
              style={{ bottom: `calc(${at(b.lo)} + 1.5px)`, height: `calc(${((b.hi - b.lo) / span) * 100}% - 3px)` }}
            >
              {prettySize(b.size)}
            </button>
          );
        })}
        {/* marker */}
        <div aria-hidden className="pointer-events-none absolute left-[2.15rem] w-[1.35rem] transition-[bottom] duration-300 ease-out" style={{ bottom: at(height) }}>
          <span className="absolute inset-x-0 h-[2px] -translate-y-1/2 rounded-full bg-cocoa" />
          <span className="absolute -right-1 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cocoa ring-2 ring-cream-50" />
        </div>
      </div>
      <p aria-hidden className="absolute -bottom-7 inset-x-0 text-center text-[0.66rem] font-semibold tracking-[0.16em] text-cocoa-400 uppercase">Height ({unit})</p>
    </div>
  );
}

/** The drawing with the four steps; pointing at a step lights up its line on the drawing. */
export function MeasureGuide({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn("grid items-center", compact ? "gap-4" : "gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12")}>
      <div className={cn("relative mx-auto w-full rounded-[2rem] bg-cream-50 ring-1 ring-cocoa/[0.05]", compact ? "max-w-[15rem] p-3" : "max-w-[24rem] p-6 sm:p-8")}>
        <MeasureFigure active={active} />
      </div>
      <ol className={cn("grid", compact ? "gap-2" : "gap-3")}>
        {HOW_TO_MEASURE.map((s) => (
          <li
            key={s.key}
            tabIndex={0}
            onPointerEnter={() => setActive(s.key)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(s.key)}
            onBlur={() => setActive(null)}
            className={cn(
              "flex gap-4 rounded-[1.25rem] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sage-300",
              compact ? "p-3" : "p-4",
              active === s.key ? "bg-white shadow-[0_10px_30px_-20px_rgb(20_16_12/0.45)]" : "bg-transparent",
            )}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cocoa text-[0.8rem] font-semibold text-cream-50">{s.n}</span>
            <span>
              <span className="block text-[1rem] font-semibold text-cocoa">{s.title}</span>
              <span className="mt-0.5 block text-[0.88rem] leading-relaxed text-cocoa-500">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

