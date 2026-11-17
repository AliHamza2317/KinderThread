"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, PackageSearch, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Drawer } from "@/components/ui/overlay";
import { useUi } from "@/stores/ui";
import type { NavCategory } from "./types";

export function MobileMenu({ categories, signedIn }: { categories: NavCategory[]; signedIn: boolean }) {
  const open = useUi((s) => s.menuOpen);
  const setMenu = useUi((s) => s.setMenu);
  const pathname = usePathname();
  const [shopOpen, setShopOpen] = useState(false);
  useEffect(() => setMenu(false), [pathname, setMenu]);

  const links = [
    { label: "Home", href: "/" },
    { label: "Baby Boys", href: "/collections/baby-boys" },
    { label: "Baby Girls", href: "/collections/baby-girls" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Collections", href: "/collections" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <Drawer open={open} onClose={() => setMenu(false)} side="left" title="Menu">
      <nav className="flex flex-col px-6 py-4" aria-label="Mobile">
        <Link href="/" className="border-b border-cocoa-100 py-4 font-display text-[1.7rem]">
          Home
        </Link>
        <div className="border-b border-cocoa-100">
          <button className="flex w-full items-center justify-between py-4 font-display text-[1.7rem]" onClick={() => setShopOpen((v) => !v)} aria-expanded={shopOpen}>
            Shop
            <ChevronDown className={`h-5 w-5 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {shopOpen && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <li>
                  <Link href="/shop" className="block py-2 pl-1 text-[1.02rem] text-cocoa-600">
                    All products
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/collections/${c.slug}`} className="block py-2 pl-1 text-[1.02rem] text-cocoa-600">
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li className="pb-3">
                  <Link href="/collections/best-sellers" className="block py-2 pl-1 text-[1.02rem] text-cocoa-600">
                    Best Sellers
                  </Link>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        {links.slice(1).map((l) => (
          <Link key={l.href} href={l.href} className="border-b border-cocoa-100 py-4 font-display text-[1.7rem]">
            {l.label}
          </Link>
        ))}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[0.8rem] font-semibold">
          <Link href={signedIn ? "/account" : "/account/login"} className="flex flex-col items-center gap-2 rounded-md bg-cream-100 py-4">
            <User className="h-5 w-5" /> Account
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-2 rounded-md bg-cream-100 py-4">
            <Heart className="h-5 w-5" /> Wishlist
          </Link>
          <Link href="/track-order" className="flex flex-col items-center gap-2 rounded-md bg-cream-100 py-4">
            <PackageSearch className="h-5 w-5" /> Track order
          </Link>
        </div>
      </nav>
    </Drawer>
  );
}
