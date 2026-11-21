"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import type { ReactNode } from "react";
import { useHydrated } from "@/lib/hooks";
import { cartCount, useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { useWishlist } from "@/stores/wishlist";

function Count({ n }: { n: number }) {
  if (!n) return null;
  return <span className="absolute -top-1.5 left-1/2 ml-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral-500 px-1 text-[0.6rem] font-bold text-cream-50">{n > 99 ? "99+" : n}</span>;
}

function Item({ label, icon, href, onClick, count = 0 }: { label: string; icon: ReactNode; href?: string; onClick?: () => void; count?: number }) {
  const inner = (
    <>
      <span className="relative">
        {icon}
        <Count n={count} />
      </span>
      <span className="mt-1 text-[0.64rem] font-semibold">{label}</span>
    </>
  );
  const cls = "flex flex-1 flex-col items-center justify-center text-cocoa-600 active:text-cocoa";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={count ? `${label}, ${count} items` : label}>
      {inner}
    </button>
  );
}

/**
 * App-style bottom bar on phones (Shop, Wishlist, Bag, Account, Search), as on Baby Planet.
 * Hidden on product pages (they have their own "Add to bag" bar) and at checkout.
 */
export function MobileTabBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setCart = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.ids.length);
  const setSearch = useUi((s) => s.setSearch);
  if (pathname.startsWith("/products/") || pathname.startsWith("/checkout")) return null;
  return (
    <>
      <nav aria-label="Quick links" data-tabbar className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-cocoa/10 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <Item label="Shop" href="/shop" icon={<LayoutGrid className="h-5 w-5" strokeWidth={1.7} />} />
        <Item label="Wishlist" href="/wishlist" count={hydrated ? wish : 0} icon={<Heart className="h-5 w-5" strokeWidth={1.7} />} />
        <Item label="Bag" onClick={() => setCart(true)} count={hydrated ? cartCount(lines) : 0} icon={<ShoppingBag className="h-5 w-5" strokeWidth={1.7} />} />
        <Item label="Account" href={signedIn ? "/account" : "/account/login"} icon={<User className="h-5 w-5" strokeWidth={1.7} />} />
        <Item label="Search" onClick={() => setSearch(true)} icon={<Search className="h-5 w-5" strokeWidth={1.7} />} />
      </nav>
    </>
  );
}
