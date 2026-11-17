"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutGrid, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { logoutAction } from "@/actions/session";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/account" ? pathname === "/account" : pathname.startsWith(href));
  return (
    <nav aria-label="Account">
      {/* mobile: horizontal scroll tabs */}
      <ul className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                isActive(href) ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa-100 bg-cream-50 text-cocoa-600 hover:border-cocoa-300",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </li>
        ))}
        <li className="shrink-0">
          <form action={logoutAction}>
            <input type="hidden" name="redirectTo" value="/" />
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-cocoa-100 bg-cream-50 px-4 text-sm font-semibold text-cocoa-600 hover:border-cocoa-300">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </li>
      </ul>

      {/* desktop: vertical list */}
      <ul className="hidden flex-col gap-1 lg:flex">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold transition",
                isActive(href) ? "bg-cream-200 text-cocoa" : "text-cocoa-500 hover:bg-cream-100 hover:text-cocoa",
              )}
            >
              <Icon className={cn("h-[1.1rem] w-[1.1rem]", isActive(href) ? "text-coral-600" : "text-cocoa-400 group-hover:text-cocoa")} />
              {label}
            </Link>
          </li>
        ))}
        <li className="mt-3 border-t border-cocoa-100 pt-3">
          <form action={logoutAction}>
            <input type="hidden" name="redirectTo" value="/" />
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa">
              <LogOut className="h-[1.1rem] w-[1.1rem] text-cocoa-400" /> Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
