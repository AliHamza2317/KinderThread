import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

/**
 * Frontend-only build: there's no authentication yet, so this page simply
 * introduces the demo dashboard. Real staff sign-in arrives with the backend.
 */
export default function AdminLogin() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-8 w-44">
          <Logo href="/" priority />
        </div>
        <div className="rounded-[1.75rem] border border-cocoa-100 bg-white/70 p-7 shadow-soft">
          <h1 className="font-display text-2xl">Store admin</h1>
          <p className="mt-2 text-sm leading-relaxed text-cocoa-500">
            This is a demo dashboard with sample products, orders and customers. Staff sign-in and saving changes will be enabled once the database is connected.
          </p>
          <ButtonLink href="/admin" className="mt-6 w-full">
            Open dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
