import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteProductAction } from "@/actions/admin/catalog";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { PageHeader } from "@/components/admin/ui";
import { getProductFormOptions } from "@/components/admin/catalog/data";
import { ProductForm, type ProductFormData } from "@/components/admin/catalog/product-form";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { ORDERS } from "@/data/admin";
import { PRODUCTS } from "@/data/catalog";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PRODUCTS.find((x) => x.id === id);
  return { title: p ? `Edit ${p.name}` : "Product" };
}

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;
  const p = PRODUCTS.find((x) => x.id === id);
  const options = await getProductFormOptions();
  const sold = ORDERS.filter((o) => o.status !== "CANCELLED" && o.status !== "RETURNED")
    .flatMap((o) => o.items)
    .filter((i) => i.productId === id)
    .reduce((n, i) => n + i.quantity, 0);
  if (!p) notFound();

  const data: ProductFormData = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    fabric: p.fabric,
    care: p.care,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    status: p.status,
    gender: p.gender,
    categoryIds: p.categoryIds,
    isFeatured: p.isFeatured,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    isSample: p.isSample,
    sizeGuideId: p.sizeGuideId,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    colors: p.colors.map((c) => ({ id: c.id, name: c.name, hex: c.hex })),
    images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, colorId: i.colorId })),
    variants: p.variants.map((v) => ({ id: v.id, size: v.size, colorId: v.colorId, sku: v.sku, stock: v.stock, price: v.price, isActive: v.isActive })),
  };

  return (
    <>
      <PageHeader
        title={p.name}
        back={{ href: "/admin/products", label: "Products" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={p.status === "ACTIVE" ? "success" : "neutral"}>{p.status.toLowerCase()}</Badge>
            {p.isSample && <Badge tone="sample">Sample</Badge>}
            <span>
              {sold} sold · updated {formatDate(p.updatedAt, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </span>
        }
        actions={
          <>
            {p.status === "ACTIVE" && (
              <Link href={`/products/${p.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.82rem] font-semibold text-sage-700 hover:bg-sage-50">
                View on store <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmSubmit message={`Delete “${p.name}” permanently? Past orders keep their item details.`}>Delete</ConfirmSubmit>
            </form>
          </>
        }
      />
      {created && (
        <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800" role="status">
          Product created. {p.status !== "ACTIVE" && "Set the status to Active when you're ready to publish it."}
        </p>
      )}
      <ProductForm key={p.updatedAt.toISOString()} product={data} categories={options.categories} sizeGuides={options.sizeGuides} />
    </>
  );
}
