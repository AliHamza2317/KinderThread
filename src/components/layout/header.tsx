"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks";
import { cartCount, useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { useWishlist } from "@/stores/wishlist";
import mark from "../../../public/brand/logo-mark.png";
import type { NavCategory } from "./types";

type Props = { categories: NavCategory[]; signedIn: boolean };

export function Header({ categories, signedIn }: Props) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const last = useRef(0);
  const setSearch = useUi((s) => s.setSearch);
  const setMenu = useUi((s) => s.setMenu);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
    const goingDown = y > last.current;
    setHidden(goingDown && y > 420 && !openMenu);
    last.current = y;
  });

  useEffect(() => setOpenMenu(null), [pathname]);

  const shopCats = categories.filter((c) => c.kind === "category");
  const collections = categories.filter((c) => c.kind === "collection");
  const featured = categories.find((c) => c.isFeatured && c.image) ?? categories[0];

  const nav = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", menu: "shop" },
    { label: "Baby Boys", href: "/collections/baby-boys" },
    { label: "Baby Girls", href: "/collections/baby-girls" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Collections", href: "/collections", menu: "collections" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500",
        scrolled ? "border-b border-cocoa-100/70 bg-cream shadow-[0_8px_30px_-18px_rgb(91_58_38/0.25)]" : "border-b border-transparent bg-cream",
      )}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="container-kt flex h-[72px] items-center gap-4 lg:h-[84px]">
        {/* mobile: menu */}
        <button className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-cocoa-50 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" aria-label="Kinder Thread home" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <Image
            src={mark}
            alt="Kinder Thread"
            priority
            sizes="120px"
            className={cn("h-auto transition-[width] duration-500 ease-[var(--ease-soft)]", scrolled ? "w-[78px] lg:w-[88px]" : "w-[86px] lg:w-[100px]")}
          />
        </Link>

        <nav className="mx-auto hidden lg:block" aria-label="Main">
          <ul className="flex items-center gap-1 xl:gap-2">
            {nav.map((item) => {
              // the most specific matching link wins, so /collections/baby-girls highlights "Baby Girls" only
              const matches = nav.filter((n) => (n.href === "/" ? pathname === "/" : pathname === n.href || pathname.startsWith(n.href + "/")));
              const best = matches.sort((a, b) => b.href.length - a.href.length)[0];
              const active = best?.href === item.href;
              return (
                <li key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.menu ?? null)}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group/nav relative inline-flex h-11 items-center gap-1 rounded-full px-3 text-[0.88rem] font-semibold transition-colors xl:px-4",
                      active ? "text-cocoa" : "text-cocoa-500 hover:text-cocoa",
                    )}
                    aria-expanded={item.menu ? openMenu === item.menu : undefined}
                    onFocus={() => setOpenMenu(item.menu ?? null)}
                    onKeyDown={(e) => e.key === "Escape" && setOpenMenu(null)}
                  >
                    {item.label}
                    {item.menu && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openMenu === item.menu && "rotate-180")} />}
                    <span
                      className={cn(
                        "absolute inset-x-3 bottom-1.5 h-px origin-left bg-cocoa transition-transform duration-500 ease-[var(--ease-soft)] xl:inset-x-4",
                        active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <IconLink onClick={() => setSearch(true)} label="Search">
            <Search className="h-[1.15rem] w-[1.15rem]" />
          </IconLink>
          <IconLink href={signedIn ? "/account" : "/account/login"} label="Account" className="hidden sm:grid">
            <User className="h-[1.15rem] w-[1.15rem]" />
          </IconLink>
          <WishlistIcon />
          <BagIcon />
        </div>
      </div>

      {/* Mega menus */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-cocoa-100 bg-cream shadow-soft lg:block"
            onMouseEnter={() => setOpenMenu(openMenu)}
          >
            <div className="container-kt grid grid-cols-12 gap-8 py-10">
              {openMenu === "shop" ? (
                <>
                  <MenuColumn title="Shop by category" className="col-span-3">
                    <MenuLink href="/shop">All products</MenuLink>
                    {shopCats.map((c) => (
                      <MenuLink key={c.id} href={`/collections/${c.slug}`}>
                        {c.name}
                      </MenuLink>
                    ))}
                  </MenuColumn>
                  <MenuColumn title="Highlights" className="col-span-3">
                    <MenuLink href="/collections/new-arrivals">New Arrivals</MenuLink>
                    <MenuLink href="/collections/best-sellers">Best Sellers</MenuLink>
                    <MenuLink href="/collections/sale">On Sale</MenuLink>
                    {collections.map((c) => (
                      <MenuLink key={c.id} href={`/collections/${c.slug}`}>
                        {c.name}
                      </MenuLink>
                    ))}
                  </MenuColumn>
                  <MenuColumn title="Shop by age" className="col-span-2">
                    <MenuLink href="/shop?age=newborn">0–6 months</MenuLink>
                    <MenuLink href="/shop?age=baby">6–12 months</MenuLink>
                    <MenuLink href="/shop?age=toddler">1–2 years</MenuLink>
                    <MenuLink href="/shop?age=little">2–5 years</MenuLink>
                  </MenuColumn>
                  {featured?.image && (
                    <Link href={`/collections/${featured.slug}`} className="group col-span-4 grid grid-cols-2 items-center gap-6 rounded-sm bg-cream-100 p-4">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                        <Image src={featured.image} alt="" fill sizes="200px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <div>
                        <p className="eyebrow">Featured</p>
                        <p className="mt-2 font-display text-2xl">{featured.name}</p>
                        <p className="mt-2 line-clamp-3 text-sm text-cocoa-500">{featured.description}</p>
                        <span className="mt-4 inline-block text-sm font-bold text-sage-700 link-underline">Shop now</span>
                      </div>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <MenuColumn title="Collections" className="col-span-4">
                    <MenuLink href="/collections/new-arrivals">New Arrivals</MenuLink>
                    <MenuLink href="/collections/best-sellers">Best Sellers</MenuLink>
                    {collections.map((c) => (
                      <MenuLink key={c.id} href={`/collections/${c.slug}`}>
                        {c.name}
                      </MenuLink>
                    ))}
                    <MenuLink href="/collections">View all collections</MenuLink>
                  </MenuColumn>
                  <div className="col-span-8 grid grid-cols-3 gap-4">
                    {collections.slice(0, 3).map((c) => (
                      <Link key={c.id} href={`/collections/${c.slug}`} className="group">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-100">
                          {c.image && <Image src={c.image} alt="" fill sizes="240px" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                        </div>
                        <p className="mt-3 font-display text-lg">{c.name}</p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MenuColumn({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="font-display text-[1.1rem] text-cocoa transition-colors hover:text-sage-700">
        {children}
      </Link>
    </li>
  );
}

function IconLink({ href, onClick, label, children, className }: { href?: string; onClick?: () => void; label: string; children: React.ReactNode; className?: string }) {
  const cls = cn("relative grid h-11 w-11 place-items-center rounded-full text-cocoa transition-colors hover:bg-cocoa-50", className);
  return href ? (
    <Link href={href} className={cls} aria-label={label}>
      {children}
    </Link>
  ) : (
    <button className={cls} onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
}

function CountBadge({ n, bump = 0 }: { n: number; bump?: number }) {
  if (n <= 0) return null;
  return (
    <motion.span
      key={bump}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 14 }}
      className="absolute top-1 right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-cocoa-800 px-1 text-[0.6rem] font-bold text-cream-50"
    >
      {n > 99 ? "99+" : n}
    </motion.span>
  );
}

function WishlistIcon() {
  const hydrated = useHydrated();
  const n = useWishlist((s) => s.ids.length);
  return (
    <IconLink href="/wishlist" label={`Wishlist${hydrated && n ? `, ${n} items` : ""}`} className="hidden sm:grid">
      <Heart className="h-[1.15rem] w-[1.15rem]" />
      {hydrated && <CountBadge n={n} />}
    </IconLink>
  );
}

function BagIcon() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const bump = useCart((s) => s.bump);
  const setOpen = useCart((s) => s.setOpen);
  const n = hydrated ? cartCount(lines) : 0;
  return (
    <button className="relative grid h-11 w-11 place-items-center rounded-full text-cocoa transition-colors hover:bg-cocoa-50" onClick={() => setOpen(true)} aria-label={`Shopping bag${n ? `, ${n} items` : ""}`}>
      <motion.span key={bump} animate={bump ? { rotate: [0, -14, 10, -6, 0], y: [0, -3, 0] } : undefined} transition={{ duration: 0.6 }}>
        <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
      </motion.span>
      <CountBadge n={n} bump={bump} />
    </button>
  );
}
