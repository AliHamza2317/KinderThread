import Image from "next/image";
import { Check, Heart, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Mode = "login" | "register" | "forgot";

const POINTS = ["Track orders and deliveries", "Save addresses for a faster checkout", "Keep a wishlist across devices"];

/** "Welcome *back*" → "Welcome" dark, "back" green with a hand-drawn swoosh under it. */
function Title({ text }: { text: string }) {
  const m = text.match(/^(.*?)\*(.+?)\*(.*)$/);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[1]}
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
 * Sign in / create account / password help: the form on the left (a small chip, the title
 * on one line with the accent word in green, rounded icon fields) and the brand photograph
 * on the right in a large rounded frame with a frosted card of account benefits.
 */
export function AuthShell({ mode, chip, title, intro, children, footer }: { mode: Mode; chip: string; title: string; intro: ReactNode; children: ReactNode; footer?: ReactNode; next?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100">
      {/* soft leaves */}
      <div aria-hidden className="pointer-events-none absolute top-28 -left-40 -z-10 h-[30rem] w-72 rotate-[24deg] rounded-[50%] bg-gradient-to-br from-sage-300/70 to-sage-100/0 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute top-[22rem] -left-28 -z-10 h-72 w-52 -rotate-[18deg] rounded-[50%] bg-gradient-to-br from-sage-200/80 to-transparent blur-xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 -z-10 h-80 w-80 rounded-full bg-sage-300/30 blur-3xl" />

      <div className="container-kt grid items-center gap-10 py-8 md:py-12 lg:grid-cols-[1fr_1.08fr] lg:gap-14 lg:py-14">
        {/* form */}
        <div className="w-full max-w-[29rem] justify-self-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[0.85rem] font-semibold text-sage-800 shadow-[0_8px_24px_-14px_rgb(20_16_12/0.35)] ring-1 ring-cocoa/[0.05]">
            <Sparkles className="h-4 w-4 text-sage-700" strokeWidth={1.8} />
            {chip}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,1.5rem+2.4vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.045em] text-cocoa sm:whitespace-nowrap">
            <Title text={title} />
          </h1>
          <p className="mt-5 max-w-[24rem] text-[1rem] leading-relaxed text-cocoa-500 md:text-[1.05rem]">{intro}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-[0.9rem] text-cocoa-500">{footer}</div>}
        </div>

        {/* photograph */}
        <div className="relative h-[26rem] overflow-hidden rounded-[2rem] bg-cream-200 shadow-[0_40px_80px_-50px_rgb(20_16_12/0.55)] sm:h-[32rem] md:rounded-[2.5rem] lg:sticky lg:top-28 lg:h-[min(46rem,calc(100svh-9rem))] lg:min-h-[38rem]">
          <Image
            src="/images/account/sign-in.webp"
            alt="Soft little sweaters on a clothing rail beside a teddy bear — Little Style, Big Smiles"
            fill
            priority={mode === "login"}
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-[58%_40%]"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-start gap-4 rounded-[1.5rem] bg-cream-50/80 p-5 shadow-[0_20px_40px_-24px_rgb(20_16_12/0.45)] ring-1 ring-white/60 backdrop-blur-xl sm:inset-x-6 sm:bottom-6 md:p-6 lg:inset-x-10 lg:bottom-8">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage-100 text-sage-700">
              <Heart className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-sans text-[1.08rem] font-semibold tracking-[-0.01em] text-cocoa md:text-[1.2rem]">Your little world, all in one place.</p>
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
