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
    <div role="radiogroup" aria-label="Size" className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
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
              "relative inline-flex h-11 min-w-[4.25rem] items-center justify-center rounded-full border px-4 text-[0.84rem] font-medium transition",
              active ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa/15 bg-cream-50 text-cocoa hover:border-cocoa",
              out && "cursor-not-allowed border-dashed text-cocoa-300 line-through hover:border-cocoa/15",
            )}
          >
            {s}
            {!out && stock <= 3 && <span aria-hidden className={cn("absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full", active ? "bg-sun-300" : "bg-coral-500")} />}
          </button>
        );
      })}
    </div>
  );
}
