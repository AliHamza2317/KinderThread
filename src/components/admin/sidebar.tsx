"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Boxes, FileText, FolderTree, Inbox, LayoutDashboard, Mail, Megaphone, Menu, RotateCcw, Ruler, Settings, ShoppingCart, Tag, Users, UserCog, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Boxes },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/inventory", label: "Inventory", icon: BarChart3 },
      { href: "/admin/size-guides", label: "Size guides", icon: Ruler },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/returns", label: "Returns & exchanges", icon: RotateCcw },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
    ],
  },
  {
    label: "Marketing & content",
    items: [
      { href: "/admin/marketing", label: "Homepage & marketing", icon: Megaphone },
      { href: "/admin/newsletter", label: "Subscribers", icon: Mail },
      { href: "/admin/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/staff", label: "Staff", icon: UserCog, adminOnly: true },
    ],
  },
];

export function AdminNav({ role }: { role: "ADMIN" | "STAFF" }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6" aria-label="Admin">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-2 px-3 text-[0.68rem] font-bold tracking-[0.18em] text-cocoa-400 uppercase">{g.label}</p>
          <ul className="flex flex-col gap-0.5">
            {g.items
              .filter((i) => !("adminOnly" in i && i.adminOnly) || role === "ADMIN")
              .map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-[0.9rem] font-semibold transition",
                        active ? "bg-cocoa text-cream-50" : "text-cocoa-600 hover:bg-cocoa-50 hover:text-cocoa",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function MobileAdminNav({ role }: { role: "ADMIN" | "STAFF" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [last, setLast] = useState(pathname);
  if (last !== pathname) {
    setLast(pathname);
    setOpen(false);
  }
  return (
    <div className="lg:hidden">
      <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-cocoa-50" onClick={() => setOpen(true)} aria-label="Open admin menu">
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-cocoa-900/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-cream p-5 shadow-lift">
            <button className="mb-4 ml-auto grid h-10 w-10 place-items-center rounded-full hover:bg-cocoa-50" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <AdminNav role={role} />
          </div>
        </div>
      )}
    </div>
  );
}

export { Inbox };
