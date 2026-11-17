import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { InventoryTable } from "@/components/admin/catalog/inventory-table";
import { Card, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { Input } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { sortSizes } from "@/lib/sizes";
import { cn } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Inventory" };

const LIMIT = 500;

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) ?? "";
  const filter = sp.filter === "low" || sp.filter === "out" ? sp.filter : undefined;

  const where: Prisma.ProductVariantWhereInput = {
    AND: [
      q ? { OR: [{ sku: { contains: q, mode: "insensitive" } }, { product: { name: { contains: q, mode: "insensitive" } } }] } : {},
      filter === "low" ? { stock: { gt: 0, lte: 3 } } : filter === "out" ? { stock: { lte: 0 } } : {},
    ],
  };

  const [variants, totals] = await Promise.all([
    db.productVariant.findMany({
      where,
      take: LIMIT,
      orderBy: [{ product: { name: "asc" } }],
      include: { product: { select: { id: true, name: true, status: true, isSample: true } }, color: { select: { name: true, hex: true, sortOrder: true } } },
    }),
    db.productVariant.groupBy({ by: ["isActive"], _sum: { stock: true }, _count: true }),
  ]);
  const [lowCount, outCount] = await Promise.all([
    db.productVariant.count({ where: { stock: { gt: 0, lte: 3 }, isActive: true, product: { status: "ACTIVE" } } }),
    db.productVariant.count({ where: { stock: { lte: 0 }, isActive: true, product: { status: "ACTIVE" } } }),
  ]);
  const units = totals.find((t) => t.isActive)?._sum.stock ?? 0;
  const variantCount = totals.reduce((n, t) => n + t._count, 0);

  // stable, readable ordering: product → colour → size ladder
  const sizeOrder = (s: string) => sortSizes(variants.map((v) => v.size)).indexOf(s);
  const sorted = [...variants].sort(
    (a, b) =>
      a.product.name.localeCompare(b.product.name) ||
      (a.color?.sortOrder ?? 0) - (b.color?.sortOrder ?? 0) ||
      sizeOrder(a.size) - sizeOrder(b.size),
  );

  const tab = (key: string | undefined, label: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (key) p.set("filter", key);
    const href = `/admin/inventory${p.toString() ? `?${p}` : ""}`;
    return (
      <Link href={href} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", filter === key ? "bg-cocoa text-cream-50" : "text-cocoa-600 hover:bg-cocoa-50")}>
        {label}
      </Link>
    );
  };

  return (
    <>
      <PageHeader title="Inventory" description="Update stock across every size and colour in one place." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Units in stock" value={units.toLocaleString("en-PK")} hint={`${variantCount} variants`} tone="sage" />
        <StatCard label="Low stock (≤3)" value={lowCount} tone="sun" href="/admin/inventory?filter=low" />
        <StatCard label="Out of stock" value={outCount} tone="coral" href="/admin/inventory?filter=out" />
      </div>
      <Card>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1">
            {tab(undefined, "All")}
            {tab("low", "Low stock")}
            {tab("out", "Out of stock")}
          </div>
          <form className="relative md:w-80" role="search">
            {filter && <input type="hidden" name="filter" value={filter} />}
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
            <Input name="q" defaultValue={q} placeholder="Search product or SKU" className="pl-10" aria-label="Search inventory" />
          </form>
        </div>
        {sorted.length === 0 ? (
          <EmptyState title="Nothing here" body={filter ? "Great — no variants match this stock filter." : "No variants match your search."} />
        ) : (
          <>
            {variants.length === LIMIT && <p className="mb-3 text-sm text-cocoa-500">Showing the first {LIMIT} variants — search to narrow down.</p>}
            <InventoryTable
              key={sorted.map((v) => `${v.id}:${v.stock}`).join(",")}
              rows={sorted.map((v) => ({
                id: v.id,
                productId: v.product.id,
                productName: v.product.name,
                productStatus: v.product.status,
                isSample: v.product.isSample,
                color: v.color?.name ?? null,
                colorHex: v.color?.hex ?? null,
                size: v.size,
                sku: v.sku,
                stock: v.stock,
                isActive: v.isActive,
              }))}
            />
          </>
        )}
      </Card>
    </>
  );
}
