import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Megaphone, Plus, Settings, ShoppingCart } from "lucide-react";
import { Card, EmptyState, OrderStatusBadge, PageHeader, StatCard, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const EXCLUDED = ["CANCELLED", "RETURNED"] as const;

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireStaff();
  const { denied } = await searchParams;
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [statusCounts, revenue, revenue30, bestSellers, lowStock, recentCustomers, recentOrders, sampleCount, productCount, subscriberCount] = await Promise.all([
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({ where: { status: { notIn: [...EXCLUDED] } }, _sum: { total: true } }),
    db.order.aggregate({ where: { status: { notIn: [...EXCLUDED] }, createdAt: { gte: since30 } }, _sum: { total: true }, _count: { _all: true } }),
    db.orderItem.groupBy({
      by: ["productId", "name"],
      where: { order: { status: { notIn: [...EXCLUDED] } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.productVariant.findMany({
      where: { stock: { lte: 3 }, isActive: true, product: { status: "ACTIVE" } },
      orderBy: [{ stock: "asc" }],
      take: 8,
      include: { product: { select: { id: true, name: true } }, color: { select: { name: true } } },
    }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true } } },
    }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, number: true, customerName: true, total: true, status: true, createdAt: true, city: true } }),
    db.product.count({ where: { isSample: true } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.subscriber.count({ where: { isActive: true } }),
  ]);

  const count = (s: string) => statusCounts.find((c) => c.status === s)?._count._all ?? 0;
  const totalOrders = statusCounts.reduce((n, c) => n + c._count._all, 0);
  const productIds = bestSellers.map((b) => b.productId).filter((x): x is string => !!x);
  const bestProducts = productIds.length
    ? await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } } })
    : [];
  const imageFor = (id: string | null) => bestProducts.find((p) => p.id === id)?.images[0]?.url;
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
            <strong>{sampleCount} sample product{sampleCount === 1 ? "" : "s"}</strong> are live for preview. Upload your real products, then remove the samples.
          </p>
          <Link href="/admin/products?sample=sample" className="inline-flex items-center gap-1 text-sm font-bold text-cocoa hover:underline">
            Review samples <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 [&>*]:min-w-0">
        <StatCard label="Total orders" value={totalOrders.toLocaleString("en-PK")} hint={`${revenue30._count._all} in the last 30 days`} href="/admin/orders" />
        <StatCard label="Revenue" value={formatPrice(revenue._sum.total ?? 0)} hint={`${formatPrice(revenue30._sum.total ?? 0)} last 30 days`} tone="sage" />
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
                      <span className="text-xs text-cocoa-500">{formatPrice(b._sum.lineTotal ?? 0)}</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums">{b._sum.quantity ?? 0}</span>
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
                      {c._count.orders} order{c._count.orders === 1 ? "" : "s"}
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
