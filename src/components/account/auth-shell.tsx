import Image from "next/image";
import Link from "next/link";
import { Heart, Package, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "forgot";

const PHOTOS: Record<Mode, { src: string; position: string }> = {
  login: { src: "/images/editorial/hero-tulle.webp", position: "50% 40%" },
  register: { src: "/images/editorial/story-feet.webp", position: "55% 50%" },
  forgot: { src: "/images/editorial/nursery.webp", position: "50% 55%" },
};

const BENEFITS = [
  { icon: Package, label: "Track every order" },
  { icon: Truck, label: "Faster checkout" },
  { icon: Heart, label: "Wishlist on every device" },
];

/**
 * Sign in / create account / password help: a lifestyle photograph with the brand line on
 * one side and the form in a soft card on the other, with a Sign in | Create account switch.
 * On phones the photo becomes a short banner and the card overlaps it.
 */
export function AuthShell({ mode, next = "/account", title, intro, children, footer }: { mode: Mode; next?: string; title: string; intro: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const photo = PHOTOS[mode];
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <section className="bg-cream-100">
      <div className="grid lg:min-h-[min(calc(100svh-7rem),56rem)] lg:grid-cols-[1.05fr_1fr]">
        {/* photograph with the brand line */}
        <div className="relative isolate h-60 overflow-hidden sm:h-80 lg:h-auto">
          <Image src={photo.src} alt="" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="-z-10 object-cover" style={{ objectPosition: photo.position }} />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-cocoa-900/80 via-cocoa-900/25 to-cocoa-900/5" />
          <div className="absolute inset-x-0 bottom-0 px-6 pt-6 pb-16 text-cream-50 sm:px-10 lg:p-12 xl:p-14">
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-cream-100/85 uppercase">Kinder Thread</p>
            <p className="mt-3 max-w-md font-display text-[clamp(1.9rem,1.1rem+2.4vw,3.4rem)] leading-[1] font-medium tracking-[-0.045em]">
              Little moments, <span className="font-serif-accent text-sun-200">beautifully</span> dressed.
            </p>
            <ul className="mt-7 hidden flex-wrap gap-2 lg:flex">
              {BENEFITS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 rounded-full bg-cream-50/12 px-3.5 py-2 text-[0.8rem] font-medium text-cream-50 ring-1 ring-cream-50/20 backdrop-blur-md">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* the form */}
        <div className="relative flex justify-center px-4 pb-14 sm:px-8 lg:items-center lg:px-10 lg:py-14">
          <div className="relative -mt-10 w-full max-w-[29rem] rounded-[1.75rem] bg-cream-50 p-6 [&_input:not([type=checkbox])]:bg-white shadow-[0_34px_80px_-42px_rgb(20_16_12/0.5)] ring-1 ring-cocoa/[0.06] sm:p-9 lg:mt-0">
            {mode !== "forgot" && (
              <nav aria-label="Account" className="grid grid-cols-2 rounded-full bg-cream-200/70 p-1 text-[0.85rem] font-semibold">
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
                    className={cn("rounded-full py-2.5 text-center transition-colors", mode === m ? "bg-cocoa text-cream-50 shadow-sm" : "text-cocoa-500 hover:text-cocoa")}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            <h1 className={cn("font-display text-[clamp(2rem,1.5rem+1.3vw,2.6rem)] leading-[1.02] font-medium tracking-[-0.04em]", mode !== "forgot" && "mt-8")}>
              <SplitWords text={title} />
            </h1>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-cocoa-500">{intro}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-7 border-t border-cocoa/10 pt-5 text-[0.85rem] leading-relaxed text-cocoa-500">{footer}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
