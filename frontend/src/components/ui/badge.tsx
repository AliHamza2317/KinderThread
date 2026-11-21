import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  sample: "bg-cream-50/90 text-cocoa-500",
  sale: "bg-coral text-cocoa-900",
  new: "bg-cream-50/95 text-cocoa",
  low: "bg-sun-100 text-sun-700",
  out: "bg-cocoa-100 text-cocoa-600",
  neutral: "bg-cocoa-50 text-cocoa-600",
  success: "bg-sage-100 text-sage-700",
  warning: "bg-sun-100 text-sun-700",
  danger: "bg-coral-100 text-coral-700",
  info: "bg-teal-100 text-teal-600",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase leading-none tracking-[0.08em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
