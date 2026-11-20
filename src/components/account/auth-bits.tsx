"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

/** "or continue with" divider. */
export function OrDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[0.78rem] text-cocoa-400" aria-hidden>
      <span className="h-px flex-1 bg-cocoa/10" />
      {label}
      <span className="h-px flex-1 bg-cocoa/10" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-[1.1rem] w-[1.1rem]" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="currentColor" aria-hidden>
      <path d="M16.37 12.62c-.02-2.24 1.83-3.32 1.91-3.37-1.04-1.52-2.66-1.73-3.24-1.75-1.38-.14-2.69.81-3.39.81-.7 0-1.78-.79-2.92-.77-1.5.02-2.89.87-3.66 2.22-1.56 2.71-.4 6.72 1.12 8.92.74 1.08 1.63 2.29 2.79 2.24 1.12-.04 1.54-.72 2.89-.72 1.35 0 1.73.72 2.92.7 1.2-.02 1.96-1.1 2.7-2.18.85-1.25 1.2-2.46 1.22-2.52-.03-.01-2.33-.9-2.34-3.58zM14.15 6.04c.62-.75 1.03-1.79.92-2.83-.89.04-1.97.59-2.6 1.34-.57.66-1.07 1.72-.94 2.74 1 .08 2-.5 2.62-1.25z" />
    </svg>
  );
}

/**
 * "Continue with Google / Apple". Social sign-in needs the accounts backend, so for now
 * the buttons explain that instead of pretending to sign in.
 */
export function SocialButtons() {
  const [note, setNote] = useState<string | null>(null);
  const btn = "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-cocoa/10 bg-white/85 px-4 text-[0.86rem] font-medium text-cocoa shadow-[0_1px_2px_rgb(20_16_12/0.04)] transition-colors hover:border-cocoa/25 hover:bg-white";
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={btn} onClick={() => setNote("Google sign-in will be available once customer accounts are connected.")}>
          <GoogleIcon /> <span className="sm:hidden">Google</span><span className="hidden truncate sm:inline">Continue with Google</span>
        </button>
        <button type="button" className={btn} onClick={() => setNote("Apple sign-in will be available once customer accounts are connected.")}>
          <AppleIcon /> <span className="sm:hidden">Apple</span><span className="hidden truncate sm:inline">Continue with Apple</span>
        </button>
      </div>
      <p role="status" className={cn("text-center text-[0.8rem] text-cocoa-500", note ? "mt-3" : "sr-only")}>
        {note ?? ""}
      </p>
    </div>
  );
}
