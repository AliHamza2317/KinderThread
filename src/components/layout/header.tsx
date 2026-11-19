"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, Heart, Lock, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks";
import { cartCount, useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { useWishlist } from "@/stores/wishlist";
import mark from "../../../public/brand/logo-mark-alpha.png";
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

  // checkout is distraction-free: logo, a way back to the bag, and a reassurance
  if (pathname === "/checkout") return <CheckoutHeader />;

  // age first, like the brands parents already shop with (ranges shown on wide screens)
  const nav: { label: string; href: string; menu?: string; sub?: string }[] = [
    { label: "Shop", href: "/shop", menu: "shop" },
    { label: "New In", href: "/collections/new-arrivals" },
    { label: "Newborn", sub: "0–6M", href: "/shop?age=newborn" },
    { label: "Baby", sub: "6–12M", href: "/shop?age=baby" },
    { label: "Toddler", sub: "1–5Y", href: "/shop?age=toddler,little" },
    { label: "Girls", href: "/collections/baby-girls" },
    { label: "Boys", href: "/collections/baby-boys" },
    { label: "Our Story", href: "/about" },
  ];

  return (
    <motion.header
      className="sticky top-0 z-40 flex h-[72px] items-center px-2.5 md:px-4 lg:h-[84px]"
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div
        className={cn(
          "mx-auto flex h-14 w-full items-center gap-3 rounded-full border px-2 transition-[max-width,background-color,border-color,box-shadow,padding] duration-700 ease-[var(--ease-soft)] lg:h-[60px] lg:px-3",
          scrolled || openMenu
            ? "max-w-[1180px] border-cocoa/[0.07] bg-cream-50/80 shadow-[0_10px_40px_-20px_rgb(20_16_12/0.35)] backdrop-blur-xl backdrop-saturate-150"
            : "max-w-[1440px] border-transparent bg-transparent",
        )}
      >
        {/* mobile: menu */}
        <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-cocoa/5 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" aria-label="Kinder Thread home" className="absolute left-1/2 -translate-x-1/2 lg:static lg:ml-2 lg:translate-x-0">
          <Image src={mark} alt="Kinder Thread" priority sizes="100px" className="h-auto w-[74px] lg:w-[82px]" />
        </Link>

        <nav className="mx-auto hidden lg:block" aria-label="Main">
          <ul className="flex items-center">
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
                      "relative inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[0.85rem] font-medium tracking-[-0.01em] transition-colors xl:px-4",
                      active ? "text-cocoa" : "text-cocoa-500 hover:text-cocoa",
                    )}
                    aria-expanded={item.menu ? openMenu === item.menu : undefined}
                    onFocus={() => setOpenMenu(item.menu ?? null)}
                    onKeyDown={(e) => e.key === "Escape" && setOpenMenu(null)}
                  >
                    {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-cocoa/[0.06]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    {item.label}
                    {item.sub && <span className="hidden text-[0.72rem] font-normal text-cocoa-400 xl:inline">{item.sub}</span>}
                    {item.menu && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openMenu === item.menu && "rotate-180")} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <IconLink onClick={() => setSearch(true)} label="Search">
            <Search className="h-[1.1rem] w-[1.1rem]" />
          </IconLink>
          <IconLink href={signedIn ? "/account" : "/account/login"} label="Account" className="hidden sm:grid">
            <User className="h-[1.1rem] w-[1.1rem]" />
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
            className="absolute inset-x-4 top-[calc(100%-6px)] mx-auto hidden max-w-[1180px] overflow-hidden rounded-[2rem] border border-cocoa/[0.07] bg-cream-50/95 shadow-[0_30px_80px_-30px_rgb(20_16_12/0.35)] backdrop-blur-xl lg:block"
            onMouseEnter={() => setOpenMenu(openMenu)}
          >
            <div className="grid grid-cols-12 gap-8 p-10">
              {openMenu === "shop" && (
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
                    <Link href={`/collections/${featured.slug}`} className="group col-span-4 grid grid-cols-2 items-center gap-6 rounded-[1.5rem] bg-cream-100 p-3 pr-5">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem]">
                        <Image src={featured.image} alt="" fill sizes="200px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <div>
                        <p className="eyebrow">Featured</p>
                        <p className="mt-2 font-display text-2xl">{featured.name}</p>
                        <p className="mt-2 line-clamp-3 text-sm text-cocoa-500">{featured.description}</p>
                        <span className="mt-4 inline-block text-sm font-semibold text-sage-700 link-underline">Shop now</span>
                      </div>
                    </Link>
                  )}
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
      <Link href={href} className="inline-block font-display text-[1.08rem] tracking-[-0.02em] text-cocoa transition-[color,transform] duration-300 hover:translate-x-1 hover:text-sage-700">
        {children}
      </Link>
    </li>
  );
}

function IconLink({ href, onClick, label, children, className }: { href?: string; onClick?: () => void; label: string; children: React.ReactNode; className?: string }) {
  const cls = cn("relative grid h-10 w-10 place-items-center rounded-full text-cocoa transition-colors hover:bg-cocoa/5", className);
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
      className="absolute -top-0.5 -right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-coral px-1 text-[0.6rem] font-bold text-cocoa-900 ring-2 ring-cream-50"
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
    <button className="relative ml-1 grid h-10 w-10 place-items-center rounded-full bg-cocoa text-cream-50 transition-colors hover:bg-sage-700" onClick={() => setOpen(true)} aria-label={`Shopping bag${n ? `, ${n} items` : ""}`}>
      <motion.span key={bump} animate={bump ? { rotate: [0, -14, 10, -6, 0], y: [0, -3, 0] } : undefined} transition={{ duration: 0.6 }}>
        <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
      </motion.span>
      <CountBadge n={n} bump={bump} />
    </button>
  );
}

function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
      <div className="container-kt grid h-[72px] grid-cols-3 items-center">
        <Link href="/cart" className="inline-flex items-center gap-2 justify-self-start text-[0.85rem] font-medium text-cocoa-600 hover:text-cocoa">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to bag</span>
        </Link>
        <Link href="/" aria-label="Kinder Thread home" className="justify-self-center">
          <Image src={mark} alt="Kinder Thread" priority sizes="100px" className="h-auto w-[74px]" />
        </Link>
        <p className="inline-flex items-center gap-2 justify-self-end text-[0.8rem] text-cocoa-500">
          <Lock className="h-4 w-4" /> <span className="hidden sm:inline">Secure checkout</span>
        </p>
      </div>
    </header>
  );
}
