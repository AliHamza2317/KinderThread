import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, PackageSearch, ShoppingBag } from "lucide-react";
import { AddressText } from "@/components/account/address-text";
import { OrderStatusPill } from "@/components/account/order-bits";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireUser } from "@/lib/auth";
import { ADDRESSES, ORDERS } from "@/data/admin";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

export default async function AccountOverview() {
  const user = await requireUser();
  const mine = ORDERS.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const orders = mine.slice(0, 3).map((o) => ({ ...o, items: o.items.slice(0, 3) }));
  const orderCount = mine.length;
  const address =
    ADDRESSES.filter((a) => a.userId === user.id).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
  const first = user.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <Eyebrow>Overview</Eyebrow>
        <h2 className="display-md mt-3">Hello, {first}</h2>
        <p className="mt-2 text-cocoa-500">
          Signed in as <span className="font-semibold break-all text-cocoa-600">{user.email}</span>
        </p>
      </header>

      <section aria-labelledby="recent-orders">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="recent-orders" className="font-display text-2xl">
            Recent orders
          </h2>
          {orderCount > 0 && (
            <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-sage-700 link-underline">
              View all ({orderCount}) <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="stitch-border flex flex-col items-center rounded-[1.5rem] px-6 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-cream-200">
              <ShoppingBag className="h-6 w-6 text-cocoa-400" />
            </span>
            <p className="mt-4 font-display text-xl">No orders yet</p>
            <p className="mt-1 max-w-sm text-sm text-cocoa-500">When you place an order while signed in, it will appear here with live updates.</p>
            <ButtonLink href="/shop" className="mt-5">
              Start shopping
            </ButtonLink>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.number}`} className="group flex items-center gap-4 rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-4 transition hover:border-cocoa-300 hover:shadow-soft">
                  <div className="flex -space-x-3">
                    {o.items.map((it, i) => (
                      <span key={i} className="relative h-14 w-12 overflow-hidden rounded-xl bg-cream-200 ring-2 ring-cream-50">
                        {it.image && <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Order {o.number}</p>
                    <p className="text-sm text-cocoa-500">{formatDate(o.createdAt)}</p>
                    <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                      <OrderStatusPill status={o.status} />
                      <span className="text-sm font-bold">{formatPrice(o.total)}</span>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <OrderStatusPill status={o.status} />
                    <p className="mt-1.5 text-sm font-bold">{formatPrice(o.total)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cocoa-400 transition group-hover:translate-x-0.5 group-hover:text-cocoa" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-6" aria-labelledby="addr-heading">
          <div className="flex items-center justify-between">
            <h2 id="addr-heading" className="flex items-center gap-2 font-sans text-base font-bold tracking-normal">
              <MapPin className="h-4 w-4 text-coral-600" /> {address?.isDefault ? "Default address" : "Address"}
            </h2>
            <Link href="/account/addresses" className="text-sm font-bold text-sage-700 link-underline">
              {address ? "Manage" : "Add"}
            </Link>
          </div>
          <div className="mt-4">
            {address ? <AddressText a={address} /> : <p className="text-sm text-cocoa-500">Save an address to make checkout quicker next time.</p>}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-cocoa-100 bg-cream-50 p-6" aria-label="Quick links">
          <h2 className="font-sans text-base font-bold tracking-normal">Quick links</h2>
          <ul className="mt-3 divide-y divide-cocoa-100">
            {[
              { href: "/track-order", label: "Track an order", icon: PackageSearch },
              { href: "/wishlist", label: "Your wishlist", icon: Heart },
              { href: "/collections/new-arrivals", label: "New arrivals", icon: ShoppingBag },
            ].map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="group flex items-center gap-3 py-3 text-[0.95rem] font-semibold text-cocoa-600 hover:text-cocoa">
                  <Icon className="h-4 w-4 text-cocoa-400" />
                  {label}
                  <ArrowRight className="ml-auto h-4 w-4 text-cocoa-300 transition group-hover:translate-x-0.5 group-hover:text-cocoa" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
