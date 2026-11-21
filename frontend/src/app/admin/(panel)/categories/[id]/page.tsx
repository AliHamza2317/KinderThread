import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteCategoryAction } from "@/actions/admin/catalog";
import { CategoryForm } from "@/components/admin/catalog/category-form";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;
  const found = CATEGORIES.find((x) => x.id === id);
  if (!found) notFound();
  const c = { ...found, _count: { products: PRODUCTS.filter((p) => p.categoryIds.includes(found.id)).length } };
  return (
    <>
      <PageHeader
        title={c.name}
        back={{ href: "/admin/categories", label: "Categories" }}
        description={`${c._count.products} product${c._count.products === 1 ? "" : "s"}`}
        actions={
          <>
            {c.isVisible && (
              <Link href={`/collections/${c.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.82rem] font-semibold text-sage-700 hover:bg-sage-50">
                View on store <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmSubmit message={`Delete “${c.name}”? Products in it are kept but removed from this category.`}>Delete</ConfirmSubmit>
            </form>
          </>
        }
      />
      {created && (
        <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800" role="status">
          Category created.
        </p>
      )}
      <CategoryForm
        category={{
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          kind: c.kind,
          sortOrder: c.sortOrder,
          isVisible: c.isVisible,
          showInNav: c.showInNav,
          isFeatured: c.isFeatured,
          seoTitle: c.seoTitle,
          seoDescription: c.seoDescription,
        }}
      />
    </>
  );
}
