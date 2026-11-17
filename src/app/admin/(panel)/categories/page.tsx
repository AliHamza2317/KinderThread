import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, EmptyState, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { DemoNotice } from "@/components/admin/demo-notice";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ deleted?: string; demo?: string }> }) {
  await requireStaff();
  const { deleted, demo } = await searchParams;
  const categories = [...CATEGORIES]
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((c) => ({ ...c, _count: { products: PRODUCTS.filter((p) => p.categoryIds.includes(c.id)).length } }));
  return (
    <>
      <PageHeader
        title="Categories & collections"
        description="Organise the shop. New Arrivals, Best Sellers and Sale are automatic collections based on product flags and discounts."
        actions={
          <ButtonLink href="/admin/categories/new">
            <Plus className="h-4 w-4" /> Add category
          </ButtonLink>
        }
      />
      <DemoNotice show={demo === "1"} />
      {deleted && (
        <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800" role="status">
          Category deleted. Products in it were kept.
        </p>
      )}
      <Card>
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" body="Create categories like Baby Boys or Newborn to organise your products." action={<ButtonLink href="/admin/categories/new">Add category</ButtonLink>} />
        ) : (
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Type</th>
                  <th className={cn(thCls, "text-right")}>Products</th>
                  <th className={thCls}>Visibility</th>
                  <th className={cn(thCls, "text-right")}>Order</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-100/60">
                    <td className={tdCls}>
                      <Link href={`/admin/categories/${c.id}`} className="flex items-center gap-3">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                          {c.image && <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />}
                        </span>
                        <span>
                          <span className="block font-semibold hover:underline">{c.name}</span>
                          <span className="text-xs text-cocoa-400">/collections/{c.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={tdCls}>{c.kind === "collection" ? "Collection" : "Category"}</td>
                    <td className={cn(tdCls, "text-right tabular-nums")}>{c._count.products}</td>
                    <td className={tdCls}>
                      <span className="flex flex-wrap gap-1">
                        {c.isVisible ? <Badge tone="success">Visible</Badge> : <Badge tone="out">Hidden</Badge>}
                        {c.showInNav && <Badge tone="info">Nav</Badge>}
                        {c.isFeatured && <Badge tone="warning">Featured</Badge>}
                      </span>
                    </td>
                    <td className={cn(tdCls, "text-right tabular-nums")}>{c.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
