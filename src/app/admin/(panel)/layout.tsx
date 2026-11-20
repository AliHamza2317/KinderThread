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
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="admin-ui min-h-dvh text-[var(--adm-ink)] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-[var(--adm-line)] bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-[var(--adm-line)] px-5">
          <div className="w-[5.5rem]">
            <Logo href="/admin" />
          </div>
          <span className="rounded-md bg-[var(--adm-page)] px-1.5 py-0.5 text-[0.62rem] font-bold tracking-[0.12em] text-[var(--adm-muted)] uppercase">Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <AdminNav role={role} />
        </div>
        <div className="border-t border-[var(--adm-line)] p-3">
          <Link href="/" target="_blank" className="flex items-center justify-between rounded-lg px-3 py-2 text-[0.85rem] font-medium text-[var(--adm-muted)] transition-colors hover:bg-[var(--adm-page)] hover:text-[var(--adm-ink)]">
            View online store <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--adm-line)] bg-white/95 px-4 backdrop-blur md:px-8">
          <MobileAdminNav role={role} />
          <div className="w-[4.5rem] lg:hidden">
            <Logo href="/admin" />
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-sun-50 px-3 py-1 text-[0.75rem] font-medium text-sun-700 ring-1 ring-sun-200 md:inline-flex">
            <Info className="h-3.5 w-3.5" />
            Demo mode — sample data, changes aren&apos;t saved yet
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" target="_blank" className="hidden h-9 items-center gap-1.5 rounded-lg border border-[var(--adm-line)] px-3 text-[0.82rem] font-semibold text-[var(--adm-ink)] transition-colors hover:bg-[var(--adm-page)] sm:inline-flex">
              View store <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link href="/" className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[0.82rem] font-semibold text-[var(--adm-muted)] transition-colors hover:bg-[var(--adm-page)] hover:text-[var(--adm-ink)] sm:inline-flex">
              <ArrowLeft className="h-3.5 w-3.5" /> Exit
            </Link>
            <div className="ml-1 flex items-center gap-2.5 border-l border-[var(--adm-line)] pl-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-700 text-[0.75rem] font-bold text-cream-50">{initials}</span>
              <span className="hidden leading-tight md:block">
                <span className="block text-[0.82rem] font-semibold">{user.name}</span>
                <span className="block text-[0.72rem] text-[var(--adm-muted)] capitalize">{role.toLowerCase()}</span>
              </span>
            </div>
          </div>
        </header>
        <p className="flex items-center gap-2 border-b border-sun-200 bg-sun-50 px-4 py-2 text-[0.78rem] text-sun-700 md:hidden">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Demo mode — changes aren&apos;t saved yet.
        </p>
        <div className="mx-auto max-w-[1240px] px-4 py-7 md:px-8 md:py-9">{children}</div>
      </div>
    </div>
  );
}
