import type { Metadata } from "next";
import Image from "next/image";
import { Info, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

/**
 * Frontend-only build: there's no authentication yet. The page shows the real
 * sign-in layout (fields disabled) and opens the demo dashboard.
 */
export default function AdminLogin() {
  return (
    <main className="admin-ui grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-14 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="w-32">
            <Logo href="/" priority />
          </div>
          <h1 className="mt-10 font-sans text-[1.6rem] font-semibold tracking-[-0.02em]">Sign in to the store admin</h1>
          <p className="mt-1.5 text-[0.9rem] text-cocoa-500">Manage products, orders, customers and the homepage.</p>

          <form className="mt-8 flex flex-col gap-4" aria-describedby="login-note">
            <label className="flex flex-col gap-1.5 text-[0.82rem] font-medium text-cocoa-600">
              Email
              <input type="email" disabled placeholder="you@kinderthread.pk" className="h-12 px-4" />
            </label>
            <label className="flex flex-col gap-1.5 text-[0.82rem] font-medium text-cocoa-600">
              Password
              <input type="password" disabled placeholder="••••••••" className="h-12 px-4" />
            </label>
            <button type="button" disabled className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cocoa/40 text-[0.9rem] font-semibold text-cream-50">
              <Lock className="h-4 w-4" /> Sign in
            </button>
          </form>

          <p id="login-note" className="mt-5 flex items-start gap-2 rounded-lg bg-sun-50 px-3.5 py-3 text-[0.8rem] leading-relaxed text-sun-700 ring-1 ring-sun-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Staff sign-in turns on once the database is connected. Until then you can open the demo dashboard with sample data.
          </p>
          <ButtonLink href="/admin" className="mt-4 w-full">
            Open demo dashboard
          </ButtonLink>
        </div>
      </div>
      <div className="relative hidden bg-cocoa lg:block" aria-hidden>
        <Image src="/images/gallery/g7.webp" alt="" fill priority sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/70 via-cocoa-900/10 to-transparent" />
        <div className="absolute inset-x-10 bottom-10 text-cream-50">
          <p className="font-display text-[2rem] leading-tight tracking-[-0.03em]">Your little world, organised.</p>
          <p className="mt-2 max-w-sm text-[0.95rem] text-cream-100/85">Orders, stock, coupons and homepage — all in one calm place.</p>
        </div>
      </div>
    </main>
  );
}
