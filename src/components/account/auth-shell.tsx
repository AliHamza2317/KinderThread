import Link from "next/link";
import { Heart, Package, RefreshCw, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "forgot";

const BENEFITS = [
  { icon: Package, title: "Track every order", body: "From confirmation to your doorstep." },
  { icon: Truck, title: "Faster checkout", body: "Saved addresses, fewer steps." },
  { icon: Heart, title: "Your wishlist, everywhere", body: "Keep favourites on every device." },
  { icon: RefreshCw, title: "Easy exchanges", body: "Request a size swap from your account." },
];

/** The golden thread from the logo: a loose line that ends in a little heart. */
function Thread({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 520 220" fill="none" className={className}>
      <path
        d="M-10 170 C 60 120, 110 210, 180 160 S 290 60, 350 120 S 420 200, 455 150 C 475 120, 470 92, 452 88 C 436 84, 428 102, 440 114 C 446 120, 455 126, 460 134 C 466 126, 475 120, 481 114 C 493 102, 485 84, 469 88 C 451 92, 446 120, 466 150 C 480 170, 505 176, 530 172"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        className="kt-thread"
      />
    </svg>
  );
}

/**
 * Sign in / create account / password help: one rounded card with a brand panel (the
 * Kinder Thread green with a stitched frame, the golden thread from the logo, a serif
 * line and what an account gives you) beside the form with Sign in | Create account tabs.
 * No photography. On phones the panel shrinks to a short band above the form.
 */
export function AuthShell({ mode, next = "/account", title, intro, children, footer }: { mode: Mode; next?: string; title: string; intro: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <section className="bg-cream-100 px-3 py-6 sm:px-6 md:py-14">
      <div className="mx-auto grid w-full max-w-[68rem] overflow-hidden rounded-[1.75rem] bg-cream-50 shadow-[0_40px_90px_-50px_rgb(20_16_12/0.5)] ring-1 ring-cocoa/[0.06] md:rounded-[2.25rem] lg:grid-cols-[0.95fr_1.05fr]">
        {/* brand panel */}
        <aside className="relative isolate flex flex-col overflow-hidden bg-sage-700 px-7 pt-7 pb-8 text-cream-50 sm:px-10 sm:pt-9 lg:px-12 lg:py-12">
          {/* stitched frame */}
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] border border-dashed border-cream-50/25 md:inset-3 md:rounded-[1.75rem]" />
          {/* soft light */}
          <div aria-hidden className="absolute -top-28 -right-24 -z-10 h-80 w-80 rounded-full bg-sage-500/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-sun-300/15 blur-3xl" />
          <Thread className="absolute right-0 bottom-0 -z-10 w-[min(32rem,120%)] text-sun-200/70 max-lg:hidden" />

          <div className="flex items-center gap-3">
            <span className="w-[6.5rem] rounded-2xl bg-cream-50 px-3 py-2 shadow-[0_10px_24px_-14px_rgb(0_0_0/0.5)] sm:w-[7.5rem]">
              <Logo href="/" />
            </span>
          </div>

          <p className="mt-7 text-[0.7rem] font-semibold tracking-[0.24em] text-cream-100/80 uppercase lg:mt-14">Your Kinder Thread account</p>
          <p className="mt-3 max-w-sm font-display text-[clamp(1.9rem,1.2rem+2vw,3.1rem)] leading-[1] font-medium tracking-[-0.045em]">
            Welcome to our <span className="font-serif-accent text-sun-200">little world.</span>
          </p>
          <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-cream-100/85 max-lg:hidden">One account for orders, addresses and the little things you love.</p>

          <ul className="mt-9 hidden gap-4 lg:grid">
            {BENEFITS.map(({ icon: Icon, title: t, body }) => (
              <li key={t} className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-50/12 ring-1 ring-cream-50/20">
                  <Icon className="h-[1.05rem] w-[1.05rem] text-sun-200" strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block text-[0.92rem] font-semibold">{t}</span>
                  <span className="block text-[0.82rem] text-cream-100/75">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* form */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14 [&_input:not([type=checkbox])]:bg-white">
          <div className="mx-auto w-full max-w-[24rem]">
            {mode !== "forgot" && (
              <nav aria-label="Account" className="mb-9 grid grid-cols-2 rounded-full bg-cream-200/70 p-1 text-[0.74rem] font-semibold tracking-[0.14em] uppercase">
                {(
                  [
                    ["login", "Sign in", `/account/login${q}`],
                    ["register", "Create account", `/account/register${q}`],
                  ] as const
                ).map(([m, label, href]) => (
                  <Link
                    key={m}
                    href={href}
                    aria-current={mode === m ? "page" : undefined}
                    className={cn("rounded-full py-2.5 text-center transition-colors", mode === m ? "bg-cocoa text-cream-50 shadow-[0_6px_16px_-8px_rgb(20_16_12/0.6)]" : "text-cocoa-500 hover:text-cocoa")}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            <h1 className="font-display text-[clamp(2rem,1.5rem+1.2vw,2.6rem)] leading-[1.02] font-medium tracking-[-0.04em]">
              <SplitWords text={title} />
            </h1>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-cocoa-500">{intro}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-7 border-t border-cocoa/10 pt-5 text-[0.85rem] leading-relaxed text-cocoa-500">{footer}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
