import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import { AdminNav, MobileAdminNav } from "@/components/admin/sidebar";
import { Logo } from "@/components/ui/logo";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Kinder Thread" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const role = user.role === "ADMIN" ? "ADMIN" : "STAFF";
  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-cocoa-100 bg-cream px-4 py-6 lg:flex">
        <div className="mb-8 w-28 px-3">
          <Logo href="/admin" />
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          <AdminNav role={role} />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-cocoa-100 bg-cream/95 px-4 backdrop-blur md:px-8">
          <MobileAdminNav role={role} />
          <p className="text-sm text-cocoa-500">
            Viewing as <strong className="text-cocoa">{user.name}</strong> <span className="text-cocoa-400">· {role.toLowerCase()}</span>
          </p>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/" target="_blank" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cocoa-600 hover:bg-cocoa-50 sm:flex">
              View store <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link href="/" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cocoa-600 hover:bg-cocoa-50">
              <ArrowLeft className="h-3.5 w-3.5" /> Exit to store
            </Link>
          </div>
        </header>
        <div className="border-b border-cocoa-100 bg-cream-100 px-4 py-2 md:px-8">
          <p className="flex items-center gap-2 text-[0.78rem] text-cocoa-500">
            <Info className="h-3.5 w-3.5 shrink-0 text-cocoa-400" />
            Demo dashboard — sample data only. Changes aren&apos;t saved until the database is connected.
          </p>
        </div>
        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
