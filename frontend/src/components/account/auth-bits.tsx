"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Classes for the rounded, icon-led fields on the sign-in pages. */
export const authInput =
  "h-[3.25rem] rounded-full border-cocoa/10 bg-white/85 pl-12 text-[0.95rem] shadow-[0_1px_2px_rgb(20_16_12/0.04)] placeholder:text-cocoa-400/70 hover:border-cocoa/20 focus:border-sage-600 focus:ring-sage-100";

/** A field with a small icon on the left. */
export function WithIcon({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="relative">
      <Icon aria-hidden className="pointer-events-none absolute top-1/2 left-[1.1rem] z-10 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-cocoa-400" strokeWidth={1.7} />
      {children}
    </div>
  );
}
