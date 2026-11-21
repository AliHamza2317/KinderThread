import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { PageHero } from "@/components/layout/page-hero";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · Kinder Thread" },
  robots: { index: false },
};

export default async function SignedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <>
      <PageHero
        eyebrow="Welcome back"
        title="My *account*"
        description="Demo account — sample data only. Changes aren't saved until accounts are connected."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "My account" }]}
        size="sm"
      />
      <div className="container-kt py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4 hidden lg:flex">My account</p>
            <AccountNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </>
  );
}
