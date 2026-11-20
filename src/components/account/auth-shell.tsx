import Link from "next/link";
import { Heart, Package, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "forgot";

const BENEFITS = [
  { icon: Package, label: "Track your orders" },
  { icon: Truck, label: "Faster checkout" },
  { icon: Heart, label: "Saved wishlist" },
];

/**
 * Sign in / create account / password help, kept simple the way Pakistani stores do it
 * (Minnie Minors, Outfitters, Sapphire): a centred panel on a calm page, Sign in | Create
 * account tabs, the form and a quiet row of account benefits. No photography.
 */
export function AuthShell({ mode, next = "/account", title, intro, children, footer }: { mode: Mode; next?: string; title: string; intro: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <section className="bg-cream-100 px-4 py-12 md:py-20">
      <div className="mx-auto w-full max-w-[27rem]">
        <div className="rounded-[1.5rem] border border-cocoa/[0.07] bg-cream-50 px-6 py-8 shadow-[0_24px_60px_-40px_rgb(20_16_12/0.35)] sm:px-10 sm:py-10 [&_input:not([type=checkbox])]:bg-white">
          {mode !== "forgot" && (
            <nav aria-label="Account" className="mb-8 grid grid-cols-2 border-b border-cocoa/10 text-center text-[0.74rem] font-semibold tracking-[0.16em] uppercase">
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
                  className={cn("-mb-px border-b-2 pb-3 transition-colors", mode === m ? "border-cocoa text-cocoa" : "border-transparent text-cocoa-400 hover:text-cocoa")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
          <div className="text-center">
            <h1 className="font-display text-[clamp(1.9rem,1.5rem+1vw,2.3rem)] leading-[1.05] font-medium tracking-[-0.035em]">
              <SplitWords text={title} />
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-[0.92rem] leading-relaxed text-cocoa-500">{intro}</p>
          </div>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-7 border-t border-cocoa/10 pt-5 text-center text-[0.85rem] leading-relaxed text-cocoa-500">{footer}</div>}
        </div>

        {mode !== "forgot" && (
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.78rem] text-cocoa-500">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-sage-700" strokeWidth={1.8} />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
