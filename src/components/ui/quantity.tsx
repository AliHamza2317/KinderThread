"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({ value, onChange, max = 10, min = 1, size = "md", label = "Quantity" }: { value: number; onChange: (v: number) => void; max?: number; min?: number; size?: "sm" | "md"; label?: string }) {
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={cn("inline-flex items-center rounded-[3px] border border-cocoa-200/70 bg-cream-50", h)} role="group" aria-label={label}>
      <button type="button" className={cn("grid place-items-center rounded-full text-cocoa-500 transition hover:text-cocoa disabled:opacity-30", size === "sm" ? "h-9 w-9" : "h-12 w-12")} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("min-w-6 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={cn("grid place-items-center rounded-full text-cocoa-500 transition hover:text-cocoa disabled:opacity-30", size === "sm" ? "h-9 w-9" : "h-12 w-12")} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
