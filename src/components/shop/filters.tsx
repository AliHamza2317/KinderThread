"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { Drawer } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { AGE_GROUPS } from "@/lib/sizes";
import { cn, formatPrice } from "@/lib/utils";

export type Facets = { colors: { name: string; hex: string }[]; sizes: string[]; genders: string[]; priceRange: { min: number; max: number } };

const GENDERS: Record<string, string> = { BOY: "Boys", GIRL: "Girls", UNISEX: "Unisex" };
const PRICES = [
  { label: `Under ${formatPrice(1500)}`, min: 0, max: 1499 },
  { label: `${formatPrice(1500)} – ${formatPrice(2499)}`, min: 1500, max: 2499 },
  { label: `${formatPrice(2500)} – ${formatPrice(3499)}`, min: 2500, max: 3499 },
  { label: `${formatPrice(3500)} and above`, min: 3500, max: 0 },
];
export const SORTS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PendingCtx = createContext<{ pending: boolean; start: (cb: () => void) => void }>({ pending: false, start: (cb) => cb() });

export function ShopProvider({ children }: { children: ReactNode }) {
  const [pending, start] = useTransition();
  return <PendingCtx.Provider value={{ pending, start }}>{children}</PendingCtx.Provider>;
}

export function PendingGrid({ children }: { children: ReactNode }) {
  const { pending } = useContext(PendingCtx);
  return <div className={cn("transition-opacity duration-300", pending && "pointer-events-none opacity-50")} aria-busy={pending}>{children}</div>;
}

function useParamsUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { start } = useContext(PendingCtx);
  const list = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);
  const push = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    p.delete("page");
    const qs = p.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const toggle = (k: string, v: string) =>
    push((p) => {
      const cur = new Set(list(k));
      if (cur.has(v)) cur.delete(v);
      else cur.add(v);
      if (cur.size) p.set(k, [...cur].join(","));
      else p.delete(k);
    });
  const set = (k: string, v: string | null) => push((p) => (v ? p.set(k, v) : p.delete(k)));
  return { sp, list, toggle, set, push };
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-cocoa-100 py-6 first:pt-0">
      <legend className="float-left mb-4 w-full text-[0.7rem] font-semibold tracking-[0.16em] text-cocoa-400 uppercase">{title}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-[0.92rem] text-cocoa-600 hover:text-cocoa">
      <input type="checkbox" checked={checked} onChange={onChange} className="kt-checkbox h-5 w-5 shrink-0 appearance-none rounded-md border border-cocoa-200 bg-cream-50 transition checked:border-cocoa checked:bg-cocoa" />
      {children}
    </label>
  );
}

export function FilterPanel({ facets, hideGender, withSort }: { facets: Facets; hideGender?: boolean; withSort?: boolean }) {
  const { sp, list, toggle, push, set } = useParamsUpdater();
  const min = Number(sp.get("min") ?? 0);
  const max = Number(sp.get("max") ?? 0);
  return (
    <div>
      {withSort && (
        <Group title="Sort by">
          {SORTS.map((o) => (
            <label key={o.value || "featured"} className="flex cursor-pointer items-center gap-3 py-1.5 text-[0.92rem] text-cocoa-600 hover:text-cocoa">
              <input
                type="radio"
                name="sort"
                checked={(sp.get("sort") ?? "") === o.value}
                onChange={() => set("sort", o.value || null)}
                className="h-5 w-5 shrink-0 appearance-none rounded-full border border-cocoa-200 bg-cream-50 transition checked:border-[6px] checked:border-cocoa"
              />
              {o.label}
            </label>
          ))}
        </Group>
      )}
      <Group title="Age">
        {AGE_GROUPS.map((a) => (
          <CheckRow key={a.id} checked={list("age").includes(a.id)} onChange={() => toggle("age", a.id)}>
            {a.label}
          </CheckRow>
        ))}
      </Group>
      {!hideGender && facets.genders.length > 1 && (
        <Group title="For">
          {(["BOY", "GIRL", "UNISEX"] as const)
            .filter((g) => facets.genders.includes(g))
            .map((g) => (
              <CheckRow key={g} checked={list("gender").includes(g.toLowerCase())} onChange={() => toggle("gender", g.toLowerCase())}>
                {GENDERS[g]}
              </CheckRow>
            ))}
        </Group>
      )}
      {facets.sizes.length > 0 && (
        <Group title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const on = list("size").includes(s);
              return (
                <button key={s} type="button" onClick={() => toggle("size", s)} aria-pressed={on} className={cn("h-9 rounded-full border px-3.5 text-[0.8rem] font-semibold transition", on ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa-100 hover:border-cocoa-400")}>
                  {s}
                </button>
              );
            })}
          </div>
        </Group>
      )}
      {facets.colors.length > 0 && (
        <Group title="Colour">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {facets.colors.map((c) => {
              const on = list("color").includes(c.name);
              return (
                <button key={c.name} type="button" onClick={() => toggle("color", c.name)} aria-pressed={on} className="flex items-center gap-2.5 rounded-lg py-1.5 text-left text-[0.88rem] text-cocoa-600 hover:text-cocoa">
                  <span className={cn("h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10", on && "ring-2 ring-cocoa ring-offset-2 ring-offset-cream")} style={{ background: c.hex }} />
                  <span className={cn(on && "font-bold text-cocoa")}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </Group>
      )}
      <Group title="Price">
        {PRICES.map((p) => {
          const on = min === p.min && max === p.max;
          return (
            <label key={p.label} className="flex cursor-pointer items-center gap-3 py-1.5 text-[0.92rem] text-cocoa-600 hover:text-cocoa">
              <input
                type="radio"
                name="price"
                checked={on}
                onChange={() =>
                  push((q) => {
                    if (p.min) q.set("min", String(p.min));
                    else q.delete("min");
                    if (p.max) q.set("max", String(p.max));
                    else q.delete("max");
                  })
                }
                onClick={() => on && push((q) => (q.delete("min"), q.delete("max")))}
                className="h-5 w-5 shrink-0 appearance-none rounded-full border border-cocoa-200 bg-cream-50 transition checked:border-[6px] checked:border-cocoa"
              />
              {p.label}
            </label>
          );
        })}
      </Group>
      <Group title="Availability">
        <CheckRow checked={sp.get("stock") === "1"} onChange={() => push((q) => (sp.get("stock") === "1" ? q.delete("stock") : q.set("stock", "1")))}>
          In stock only
        </CheckRow>
        <CheckRow checked={sp.get("sale") === "1"} onChange={() => push((q) => (sp.get("sale") === "1" ? q.delete("sale") : q.set("sale", "1")))}>
          On sale
        </CheckRow>
      </Group>
    </div>
  );
}

const KEYS = ["age", "gender", "size", "color", "min", "max", "stock", "sale"];

export function ActiveFilters() {
  const { sp, list, toggle, push } = useParamsUpdater();
  const chips: { label: string; remove: () => void }[] = [];
  list("age").forEach((a) => chips.push({ label: AGE_GROUPS.find((g) => g.id === a)?.label.split(" · ")[1] ?? a, remove: () => toggle("age", a) }));
  list("gender").forEach((g) => chips.push({ label: GENDERS[g.toUpperCase()] ?? g, remove: () => toggle("gender", g) }));
  list("size").forEach((s) => chips.push({ label: `Size ${s}`, remove: () => toggle("size", s) }));
  list("color").forEach((c) => chips.push({ label: c, remove: () => toggle("color", c) }));
  if (sp.get("min") || sp.get("max")) {
    const lo = Number(sp.get("min") ?? 0);
    const hi = Number(sp.get("max") ?? 0);
    chips.push({ label: hi ? `${formatPrice(lo)} – ${formatPrice(hi)}` : `${formatPrice(lo)}+`, remove: () => push((q) => (q.delete("min"), q.delete("max"))) });
  }
  if (sp.get("stock") === "1") chips.push({ label: "In stock", remove: () => push((q) => q.delete("stock")) });
  if (sp.get("sale") === "1") chips.push({ label: "On sale", remove: () => push((q) => q.delete("sale")) });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.label} onClick={c.remove} className="inline-flex items-center gap-1.5 rounded-full border border-cocoa/10 bg-cream-50 py-1.5 pr-2.5 pl-3.5 text-[0.8rem] font-medium text-cocoa-600 transition hover:border-cocoa" aria-label={`Remove filter ${c.label}`}>
          {c.label} <X className="h-3.5 w-3.5" />
        </button>
      ))}
      <button onClick={() => push((q) => KEYS.forEach((k) => q.delete(k)))} className="px-2 text-[0.8rem] font-semibold text-cocoa underline underline-offset-4 hover:text-sage-700">
        Clear all
      </button>
    </div>
  );
}

export function SortSelect() {
  const { sp, set } = useParamsUpdater();
  return (
    <label className="flex items-center gap-2 text-[0.85rem] text-cocoa-500">
      <span className="hidden xl:inline">Sort by</span>
      <select value={sp.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value || null)} className="h-10 cursor-pointer rounded-full border border-cocoa/12 bg-cream-50 pr-8 pl-4 text-[0.85rem] font-medium text-cocoa focus:border-cocoa focus:outline-none" aria-label="Sort products">
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Quick age filters shown in the toolbar (the most-used filter for parents). */
export function AgePills() {
  const { list, toggle } = useParamsUpdater();
  const on = list("age");
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by age">
      {AGE_GROUPS.map((a) => {
        const active = on.includes(a.id);
        const [name, range] = a.label.split(" · ");
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle("age", a.id)}
            aria-pressed={active}
            className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[0.82rem] font-medium whitespace-nowrap transition-colors", active ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa/12 text-cocoa-600 hover:border-cocoa hover:text-cocoa")}
          >
            {name}
            <span className={cn("text-[0.74rem]", active ? "text-cream-200" : "text-cocoa-400")}>{range}</span>
          </button>
        );
      })}
    </div>
  );
}

/** "Filter & sort" button + drawer (all screen sizes, like most brand stores). */
export function FilterDrawer({ facets, total, hideGender }: { facets: Facets; total: number; hideGender?: boolean }) {
  const [open, setOpen] = useState(false);
  const { sp } = useParamsUpdater();
  const count = KEYS.filter((k) => sp.get(k)).length;
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-cocoa px-4 text-[0.85rem] font-medium text-cream-50 transition-colors hover:bg-sage-700">
        <SlidersHorizontal className="h-4 w-4" /> Filter <span className="hidden sm:inline">& sort</span>
        {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-cream-50 px-1 text-[0.65rem] font-semibold text-cocoa">{count}</span>}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Filter & sort" footer={<Button className="w-full" onClick={() => setOpen(false)}>Show {total} {total === 1 ? "product" : "products"}</Button>}>
        <div className="px-6 py-6">
          <FilterPanel facets={facets} hideGender={hideGender} withSort />
        </div>
      </Drawer>
    </>
  );
}
