import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { deleteSampleProductsAction } from "@/actions/admin/catalog";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { Card, EmptyState, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { DemoNotice } from "@/components/admin/demo-notice";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const PER_PAGE = 25;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireStaff();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) ?? "";
  const status = ["DRAFT", "ACTIVE", "ARCHIVED"].includes(sp.status ?? "") ? (sp.status as "DRAFT" | "ACTIVE" | "ARCHIVED") : undefined;
  const sample = sp.sample === "sample" || sp.sample === "real" ? sp.sample : undefined;
  const category = sp.category || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const needle = q.toLowerCase();
  const filtered = PRODUCTS.filter((p) => {
    if (needle && !(p.name.toLowerCase().includes(needle) || p.slug.includes(needle) || p.variants.some((v) => v.sku.toLowerCase().includes(needle)))) return false;
    if (status && p.status !== status) return false;
    if (sample && p.isSample !== (sample === "sample")) return false;
    if (category && !p.categoryIds.includes(category)) return false;
    return true;
  }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const total = filtered.length;
  const products = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => ({
    ...p,
    categories: CATEGORIES.filter((c) => p.categoryIds.includes(c.id)).map((c) => ({ name: c.name })),
  }));
  const categories = [...CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)).map((c) => ({ id: c.id, name: c.name }));
  const sampleCount = PRODUCTS.filter((p) => p.isSample).length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, status, sample, category, page, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && !(k === "page" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"}${q || status || sample || category ? " match your filters" : ""}`}
        actions={
          <ButtonLink href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add product
          </ButtonLink>
        }
      />

      <DemoNotice show={sp.demo === "1"} />
      {sp.removedSamples && (
        <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800" role="status">
          Removed {sp.removedSamples} sample product{sp.removedSamples === "1" ? "" : "s"}.
        </p>
      )}
      {sp.deleted && (
        <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800" role="status">
          Product deleted.
        </p>
      )}

      {sampleCount > 0 && (
        <Card className="mb-6 border-sun-200 bg-sun-50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                {sampleCount} sample product{sampleCount === 1 ? "" : "s"} in the catalogue
              </p>
              <p className="mt-0.5 text-sm text-cocoa-600">These are placeholders for development. Remove them once your real products are uploaded.</p>
            </div>
            {user.role === "ADMIN" ? (
              <form action={deleteSampleProductsAction}>
                <ConfirmSubmit message={`Permanently delete all ${sampleCount} sample products? Existing orders keep their item details.`}>Remove all samples</ConfirmSubmit>
              </form>
            ) : (
              <p className="text-xs text-cocoa-500">Only administrators can remove samples.</p>
            )}
          </div>
        </Card>
      )}

      <Card>
        <form className="mb-5 grid gap-3 md:grid-cols-[1fr_170px_200px_150px_auto]" role="search">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
            <Input name="q" defaultValue={q} placeholder="Search name, slug or SKU" className="pl-10" aria-label="Search products" />
          </div>
          <Select name="status" defaultValue={status ?? ""} aria-label="Status">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
          <Select name="category" defaultValue={category ?? ""} aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select name="sample" defaultValue={sample ?? ""} aria-label="Sample or real">
            <option value="">Real & sample</option>
            <option value="real">Real only</option>
            <option value="sample">Samples only</option>
          </Select>
          <button className="h-12 rounded-full bg-cocoa px-6 text-sm font-semibold text-cream-50 hover:bg-cocoa-800">Filter</button>
        </form>

        {products.length === 0 ? (
          <EmptyState
            title={q || status || sample || category ? "No products match" : "No products yet"}
            body={q || status || sample || category ? "Try clearing the filters." : "Add your first product to start selling."}
            action={
              q || status || sample || category ? (
                <ButtonLink href="/admin/products" variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : (
                <ButtonLink href="/admin/products/new">Add product</ButtonLink>
              )
            }
          />
        ) : (
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Product</th>
                  <th className={thCls}>Status</th>
                  <th className={cn(thCls, "text-right")}>Price</th>
                  <th className={cn(thCls, "text-right")}>Stock</th>
                  <th className={thCls}>Categories</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stock = p.variants.filter((v) => v.isActive).reduce((n, v) => n + v.stock, 0);
                  return (
                    <tr key={p.id} className="hover:bg-cream-100/60">
                      <td className={tdCls}>
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                            {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold hover:underline">{p.name}</span>
                            <span className="mt-1 flex flex-wrap gap-1">
                              {p.isSample && <Badge tone="sample">Sample</Badge>}
                              {p.isFeatured && <Badge tone="info">Featured</Badge>}
                              {p.isNewArrival && <Badge tone="success">New</Badge>}
                              {p.isBestSeller && <Badge tone="warning">Best</Badge>}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className={tdCls}>
                        <Badge tone={p.status === "ACTIVE" ? "success" : p.status === "DRAFT" ? "neutral" : "out"}>{p.status.toLowerCase()}</Badge>
                      </td>
                      <td className={cn(tdCls, "text-right whitespace-nowrap tabular-nums")}>
                        {formatPrice(p.price)}
                        {p.compareAtPrice && <span className="block text-xs text-cocoa-400 line-through">{formatPrice(p.compareAtPrice)}</span>}
                      </td>
                      <td className={cn(tdCls, "text-right tabular-nums", stock === 0 ? "font-semibold text-coral-700" : stock <= 5 ? "text-sun-700" : "")}>
                        {stock}
                        <span className="block text-xs text-cocoa-400">{p.variants.length} variants</span>
                      </td>
                      <td className={cn(tdCls, "text-cocoa-500")}>{p.categories.map((c) => c.name).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}

        {pages > 1 && (
          <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
            <span className="text-cocoa-500">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <ButtonLink href={`/admin/products${qs({ page: page - 1 })}`} variant="secondary" size="sm">
                  Previous
                </ButtonLink>
              )}
              {page < pages && (
                <ButtonLink href={`/admin/products${qs({ page: page + 1 })}`} variant="secondary" size="sm">
                  Next
                </ButtonLink>
              )}
            </div>
          </nav>
        )}
      </Card>
    </>
  );
}
