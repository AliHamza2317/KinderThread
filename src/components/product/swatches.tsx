"use client";

import { cn } from "@/lib/utils";
import { sizeLabel } from "@/lib/sizes";

export function ColorSwatches({
  colors,
  value,
  onChange,
  hasStock,
}: {
  colors: { id: string; name: string; hex: string }[];
  value: string | null;
  onChange: (id: string) => void;
  hasStock?: (id: string) => boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2.5">
      {colors.map((c) => {
        const active = c.id === value;
        const available = hasStock ? hasStock(c.id) : true;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${c.name}${available ? "" : " (sold out)"}`}
            title={c.name}
            onClick={() => onChange(c.id)}
            className={cn(
              "relative grid h-10 w-10 place-items-center rounded-full transition",
              active ? "ring-2 ring-cocoa ring-offset-2 ring-offset-cream" : "ring-1 ring-cocoa-100 hover:ring-cocoa-300",
            )}
          >
            <span className="h-8 w-8 rounded-full border border-black/5" style={{ background: c.hex }} />
            {!available && <span className="absolute h-[1.5px] w-9 rotate-45 bg-cocoa-500/70" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

export function SizeGrid({
  sizes,
  value,
  onChange,
  stockFor,
  compact,
}: {
  sizes: string[];
  value: string | null;
  onChange: (s: string) => void;
  stockFor: (s: string) => number;
  compact?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Size" className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4")}>
      {sizes.map((s) => {
        const stock = stockFor(s);
        const active = value === s;
        const out = stock <= 0;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${sizeLabel(s)}${out ? ", sold out" : stock <= 3 ? `, only ${stock} left` : ""}`}
            disabled={out}
            onClick={() => onChange(s)}
            className={cn(
              "relative flex h-12 flex-col items-center justify-center rounded-sm border text-[0.82rem] font-semibold transition",
              active ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa-100 bg-cream-50 hover:border-cocoa-400",
              out && "cursor-not-allowed border-dashed text-cocoa-300 line-through hover:border-cocoa-100",
            )}
          >
            {s}
            {!out && stock <= 3 && <span className={cn("text-[0.6rem] font-bold", active ? "text-sun-200" : "text-coral-700")}>{stock} left</span>}
          </button>
        );
      })}
    </div>
  );
}
