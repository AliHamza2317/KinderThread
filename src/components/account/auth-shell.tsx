import Image from "next/image";
import Link from "next/link";
import { Check, Heart, User, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "forgot";

const POINTS = ["Track orders and deliveries", "Save addresses for a faster checkout", "Keep a wishlist across devices"];

/** "Welcome *back*" → "Welcome" dark, "back" green with a hand-drawn swoosh under it. */
function Title({ text }: { text: string }) {
  const m = text.match(/^(.*?)\*(.+?)\*(.*)$/);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[1]}
      <br className="lg:hidden" />
      <span className="relative inline-block text-sage-700">
        {m[2]}
        <svg aria-hidden viewBox="0 0 240 24" fill="none" preserveAspectRatio="none" className="absolute -bottom-[0.32em] left-[-4%] h-[0.42em] w-[135%] text-sage-400">
          <path d="M3 19 C 52 7, 118 2, 236 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      {m[3]}
    </>
  );
}

/**
 * Sign in / create account / password help: the form on the left (the title
 * on one line with the accent word in green, rounded icon fields) and the brand photograph
 * on the right in a large rounded frame with a frosted card of account benefits.
 */
export function AuthShell({ mode, title, intro, children, footer, next = "/account" }: { mode: Mode; title: string; intro: ReactNode; children: ReactNode; footer?: ReactNode; next?: string }) {
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100 max-lg:bg-cream-100">
      {/* soft leaves */}
      <div aria-hidden className="pointer-events-none absolute top-28 -left-40 -z-10 h-[30rem] w-72 rotate-[24deg] rounded-[50%] bg-gradient-to-br from-sage-300/70 to-sage-100/0 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute top-[22rem] -left-28 -z-10 h-72 w-52 -rotate-[18deg] rounded-[50%] bg-gradient-to-br from-sage-200/80 to-transparent blur-xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 -z-10 h-80 w-80 rounded-full bg-sage-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-6 -right-10 -z-10 h-40 w-40 rounded-full bg-sage-300/40 blur-2xl lg:hidden" />

      <div className="container-kt grid items-center gap-10 pt-8 md:pt-12 lg:grid-cols-[1fr_1.08fr] lg:gap-14 lg:py-14">
        {/* form */}
        <div className="w-full justify-self-center lg:max-w-[29rem]">
          <h1 className="font-display text-[clamp(3.1rem,2rem+3vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-cocoa lg:text-[clamp(2.4rem,1.5rem+2.4vw,3.75rem)] lg:whitespace-nowrap">
            <Title text={title} />
          </h1>
          <p className="mt-5 max-w-[22rem] text-[1rem] leading-relaxed text-cocoa-500 lg:max-w-[24rem] lg:text-[1.05rem]">{intro}</p>

          {/* phones: the photograph under the heading, fading into the page */}
          <div className="relative -mx-5 -mt-4 aspect-[1373/1146] [mask-image:linear-gradient(to_bottom,transparent,black_30%)] sm:-mx-8 lg:hidden">
            <Image src="/images/account/sign-in.webp" alt="" fill priority={mode === "login"} sizes="100vw" className="object-cover" />
          </div>

          {/* the form: a rounded sheet on phones, plain on computers */}
          <div className="relative z-10 -mx-5 -mt-12 rounded-t-[2.5rem] bg-cream-50 px-5 pt-6 pb-28 shadow-[0_-24px_50px_-36px_rgb(20_16_12/0.4)] sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-7 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
            {mode !== "forgot" && (
              <nav aria-label="Account" className="mb-6 grid grid-cols-2 rounded-full bg-cream-200/70 p-1.5 lg:hidden">
                {(
                  [
                    ["login", "Sign In", `/account/login${q}`, User],
                    ["register", "Sign Up", `/account/register${q}`, UserPlus],
                  ] as const
                ).map(([m, label, href, Icon]) => (
                  <Link
                    key={m}
                    href={href}
                    aria-current={mode === m ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center justify-center gap-2.5 rounded-full text-[1rem] font-semibold transition-colors",
                      mode === m ? "bg-white text-sage-800 shadow-[0_8px_20px_-12px_rgb(20_16_12/0.4)]" : "text-cocoa-400",
                    )}
                  >
                    <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={mode === m ? 2.2 : 1.8} />
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            {children}
            {footer && <div className="mt-6 text-center text-[0.9rem] text-cocoa-500">{footer}</div>}
          </div>
        </div>

        {/* photograph (computers): the photo ends above the card, which sits on a matching floor */}
        <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-[#e5c3a0] shadow-[0_40px_80px_-50px_rgb(20_16_12/0.55)] lg:sticky lg:top-28 lg:block lg:h-[min(46rem,calc(100svh-9rem))] lg:min-h-[38rem]">
          <div className="absolute inset-x-0 top-0 bottom-[8.5rem]">
            <Image
              src="/images/account/sign-in.webp"
              alt="Soft little sweaters on a clothing rail beside a teddy bear — Little Style, Big Smiles"
              fill
              priority={mode === "login"}
              sizes="52vw"
              className="object-cover object-[58%_100%]"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#e5c3a0]" />
          </div>
          <div className="absolute inset-x-8 bottom-6 flex items-start gap-4 rounded-[1.5rem] bg-cream-50/80 p-6 shadow-[0_20px_40px_-24px_rgb(20_16_12/0.45)] ring-1 ring-white/60 backdrop-blur-xl xl:inset-x-12">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage-100 text-sage-700">
              <Heart className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-sans text-[1.2rem] font-semibold tracking-[-0.01em] text-cocoa">Your little world, all in one place.</p>
              <ul className="mt-2.5 grid gap-1.5 text-[0.86rem] text-cocoa-600">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-sage-600" strokeWidth={2.4} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
