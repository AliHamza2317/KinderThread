import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Megaphone, Plus, Settings, ShoppingCart } from "lucide-react";
import { Card, EmptyState, OrderStatusBadge, PageHeader, StatCard, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { CUSTOMERS, ORDERS, SUBSCRIBERS } from "@/data/admin";
import { PRODUCTS } from "@/data/catalog";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const EXCLUDED = ["CANCELLED", "RETURNED"] as const;

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireStaff();
  const { denied } = await searchParams;
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // everything below is computed from the dummy data in src/data
  const counted = ORDERS.filter((o) => !(EXCLUDED as readonly string[]).includes(o.status));
  const sum = (list: typeof ORDERS) => list.reduce((n, o) => n + o.total, 0);
  const last30 = counted.filter((o) => o.createdAt >= since30);
  const count = (s: string) => ORDERS.filter((o) => o.status === s).length;
  const totalOrders = ORDERS.length;

  const sales = new Map<string, { productId: string | null; name: string; quantity: number; lineTotal: number }>();
  for (const it of counted.flatMap((o) => o.items)) {
    const key = `${it.productId}-${it.name}`;
    const row = sales.get(key) ?? { productId: it.productId, name: it.name, quantity: 0, lineTotal: 0 };
    row.quantity += it.quantity;
    row.lineTotal += it.lineTotal;
    sales.set(key, row);
  }
  const bestSellers = [...sales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const imageFor = (id: string | null) => PRODUCTS.find((p) => p.id === id)?.images[0]?.url;

  const lowStock = PRODUCTS.filter((p) => p.status === "ACTIVE")
    .flatMap((p) => p.variants.filter((v) => v.isActive && v.stock <= 3).map((v) => ({ ...v, product: { id: p.id, name: p.name }, color: p.colors.find((c) => c.id === v.colorId) ?? null })))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const recentCustomers = [...CUSTOMERS]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((c) => ({ ...c, orderCount: ORDERS.filter((o) => o.userId === c.id).length }));
  const recentOrders = [...ORDERS].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);
  const sampleCount = PRODUCTS.filter((p) => p.isSample).length;
  const productCount = PRODUCTS.filter((p) => p.status === "ACTIVE").length;
  const subscriberCount = SUBSCRIBERS.filter((x) => x.isActive).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        description="Here's how Kinder Thread is doing."
        actions={
          <>
            <ButtonLink href="/admin/products/new" size="sm">
              <Plus className="h-4 w-4" /> Add product
            </ButtonLink>
            <ButtonLink href="/admin/orders" variant="secondary" size="sm">
              View orders
            </ButtonLink>
          </>
        }
      />

      {denied && (
        <p className="mb-6 rounded-xl bg-coral-100 px-4 py-3 text-sm font-medium text-coral-800" role="alert">
          That area is only available to administrators.
        </p>
      )}

      {sampleCount > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-sun-200 bg-sun-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cocoa-700">
            <strong>{sampleCount} sample product{sampleCount === 1 ? "" : "s"}</strong> are shown for preview. Once the database is connected, upload your real products and remove the samples.
          </p>
          <Link href="/admin/products?sample=sample" className="inline-flex items-center gap-1 text-sm font-bold text-cocoa hover:underline">
            Review samples <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 [&>*]:min-w-0">
        <StatCard label="Total orders" value={totalOrders.toLocaleString("en-PK")} hint={`${last30.length} in the last 30 days`} href="/admin/orders" />
        <StatCard label="Revenue" value={formatPrice(sum(counted))} hint={`${formatPrice(sum(last30))} last 30 days`} tone="sage" />
        <StatCard label="Pending" value={count("PENDING")} hint="Awaiting confirmation" tone="sun" href="/admin/orders?status=PENDING" />
        <StatCard label="Delivered" value={count("DELIVERED")} tone="sage" href="/admin/orders?status=DELIVERED" />
        <StatCard label="Cancelled" value={count("CANCELLED")} tone="coral" href="/admin/orders?status=CANCELLED" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3 [&>*]:min-w-0">
        <Card
          className="xl:col-span-2"
          title="Recent orders"
          actions={
            <Link href="/admin/orders" className="text-sm font-semibold text-sage-700 hover:underline">
              View all
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" body="When customers place orders they'll appear here." />
          ) : (
            <TableWrap>
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Order</th>
                    <th className={thCls}>Customer</th>
                    <th className={thCls}>Status</th>
                    <th className={cn(thCls, "text-right")}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream-100/60">
                      <td className={tdCls}>
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">
                          {o.number}
                        </Link>
                        <span className="block text-xs text-cocoa-400">{formatDate(o.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                      </td>
                      <td className={tdCls}>
                        {o.customerName}
                        <span className="block text-xs text-cocoa-400">{o.city}</span>
                      </td>
                      <td className={tdCls}>
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className={cn(tdCls, "text-right font-semibold tabular-nums")}>{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>

        <Card title="Best sellers" description="By units sold (excluding cancelled & returned)">
          {bestSellers.length === 0 ? (
            <p className="rounded-xl bg-cream-100 px-4 py-6 text-center text-sm text-cocoa-500">Sales data will appear after your first orders.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {bestSellers.map((b, i) => {
                const img = imageFor(b.productId);
                const inner = (
                  <>
                    <span className="w-5 text-sm font-bold text-cocoa-400">{i + 1}</span>
                    <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">{img && <Image src={img} alt="" fill sizes="40px" className="object-cover" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{b.name}</span>
                      <span className="text-xs text-cocoa-500">{formatPrice(b.lineTotal)}</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums">{b.quantity}</span>
                  </>
                );
                return (
                  <li key={`${b.productId}-${b.name}`}>
                    {b.productId ? (
                      <Link href={`/admin/products/${b.productId}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-cream-100">
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 p-1">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        <Card
          title="Low stock"
          description="Active variants with 3 or fewer left"
          actions={
            <Link href="/admin/inventory?filter=low" className="text-sm font-semibold text-sage-700 hover:underline">
              Inventory
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <p className="rounded-xl bg-sage-50 px-4 py-6 text-center text-sm text-sage-700">Everything is well stocked.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-cocoa-50">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/products/${v.product.id}`} className="min-w-0 hover:underline">
                    <span className="block truncate text-sm font-semibold">{v.product.name}</span>
                    <span className="text-xs text-cocoa-500">{[v.color?.name, v.size].filter(Boolean).join(" · ")}</span>
                  </Link>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", v.stock <= 0 ? "bg-coral-100 text-coral-700" : "bg-sun-100 text-sun-700")}>
                    {v.stock <= 0 ? "Sold out" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent customers"
          actions={
            <Link href="/admin/customers" className="text-sm font-semibold text-sage-700 hover:underline">
              View all
            </Link>
          }
        >
          {recentCustomers.length === 0 ? (
            <p className="rounded-xl bg-cream-100 px-4 py-6 text-center text-sm text-cocoa-500">No customer accounts yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-cocoa-50">
              {recentCustomers.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3 py-2.5 hover:underline">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-100 text-sm font-bold text-sage-700">{c.name.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{c.name}</span>
                      <span className="block truncate text-xs text-cocoa-500">{c.email}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-cocoa-500">
                      {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                      <span className="block">{formatDate(c.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Store at a glance">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-cream-100 p-4">
              <dt className="text-cocoa-500">Active products</dt>
              <dd className="mt-1 font-display text-2xl">{productCount}</dd>
            </div>
            <div className="rounded-xl bg-cream-100 p-4">
              <dt className="text-cocoa-500">Subscribers</dt>
              <dd className="mt-1 font-display text-2xl">{subscriberCount}</dd>
            </div>
          </dl>
          <ul className="mt-5 grid grid-cols-2 gap-2 text-sm font-semibold">
            {[
              { href: "/admin/products", label: "Products", icon: Boxes },
              { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
              { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
              { href: "/admin/settings", label: "Settings", icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-2 rounded-xl border border-cocoa-100 px-3 py-2.5 hover:border-cocoa-300 hover:bg-cream-100">
                  <Icon className="h-4 w-4 text-cocoa-500" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
