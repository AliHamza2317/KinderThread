import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "My account", template: "%s · My account · Kinder Thread" }, robots: { index: false } };

export default async function SignedInLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="container-kt py-10 md:py-14">
      <p role="note" className="mb-8 border-l-2 border-cocoa-200 py-1 pl-3 text-[0.82rem] text-cocoa-500">
        Demo account — sample data only. Changes aren&apos;t saved until accounts are connected.
      </p>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-4 hidden lg:flex">My account</p>
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
