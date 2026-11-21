"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Heart, PackageSearch, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Drawer } from "@/components/ui/overlay";
import { useUi } from "@/stores/ui";
import type { NavCategory } from "./types";

const item = "flex items-center justify-between py-3.5 text-[1rem] font-medium tracking-[-0.01em] text-cocoa";
const row = `${item} border-b border-cocoa-100`;
const sub = "block py-2 pl-1 text-[0.9rem] text-cocoa-600 hover:text-cocoa";

export function MobileMenu({ categories, signedIn }: { categories: NavCategory[]; signedIn: boolean }) {
  const open = useUi((s) => s.menuOpen);
  const setMenu = useUi((s) => s.setMenu);
  const pathname = usePathname();
  const [shopOpen, setShopOpen] = useState(false);
  useEffect(() => setMenu(false), [pathname, setMenu]);

  const links = [
    { label: "Home", href: "/" },
    { label: "New In", href: "/collections/new-arrivals" },
    { label: "Girls", href: "/collections/baby-girls" },
    { label: "Boys", href: "/collections/baby-boys" },
    { label: "Collections", href: "/collections" },
    { label: "Our Story", href: "/about" },
  ];
  const ages = [
    { label: "Newborn", href: "/shop?age=newborn" },
    { label: "Baby", href: "/shop?age=baby" },
    { label: "Toddler", href: "/shop?age=toddler" },
    { label: "Little ones", href: "/shop?age=little" },
  ];

  return (
    <Drawer open={open} onClose={() => setMenu(false)} side="left" title="Menu">
      <nav className="flex flex-col px-6 py-2" aria-label="Mobile">
        <Link href="/" className={row}>
          Home
          <ChevronRight className="h-4 w-4 text-cocoa-300" />
        </Link>
        <div className="border-b border-cocoa-100">
          <button className={`${item} w-full`} onClick={() => setShopOpen((v) => !v)} aria-expanded={shopOpen}>
            Shop
            <ChevronDown className={`h-4 w-4 text-cocoa-400 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {shopOpen && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <li>
                  <Link href="/shop" className={sub}>
                    All products
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/collections/${c.slug}`} className={sub}>
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li className="pb-3">
                  <Link href="/collections/best-sellers" className={sub}>
                    Best Sellers
                  </Link>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <div className="border-b border-cocoa-100 py-4">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-cocoa-400 uppercase">Shop by age</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {ages.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="flex h-11 items-center rounded-xl bg-cream-100 px-4 text-[0.9rem] font-medium transition-colors hover:bg-cocoa hover:text-cream-50">
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {links.slice(1).map((l) => (
          <Link key={l.href} href={l.href} className={row}>
            {l.label}
            <ChevronRight className="h-4 w-4 text-cocoa-300" />
          </Link>
        ))}
        <div className="mt-5 mb-4 grid grid-cols-3 gap-2.5 text-center text-[0.78rem] font-semibold">
          <Link href={signedIn ? "/account" : "/account/login"} className="flex flex-col items-center gap-1.5 rounded-xl bg-cream-100 py-3.5">
            <User className="h-[1.1rem] w-[1.1rem]" /> Account
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-1.5 rounded-xl bg-cream-100 py-3.5">
            <Heart className="h-[1.1rem] w-[1.1rem]" /> Wishlist
          </Link>
          <Link href="/track-order" className="flex flex-col items-center gap-1.5 rounded-xl bg-cream-100 py-3.5">
            <PackageSearch className="h-[1.1rem] w-[1.1rem]" /> Track order
          </Link>
        </div>
      </nav>
    </Drawer>
  );
}
