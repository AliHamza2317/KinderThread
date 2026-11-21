import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { getProductFormOptions } from "@/components/admin/catalog/data";
import { ProductForm } from "@/components/admin/catalog/product-form";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireStaff();
  const options = await getProductFormOptions();
  return (
    <>
      <PageHeader title="New product" back={{ href: "/admin/products", label: "Products" }} description="Products start as drafts until you set them to Active." />
      <ProductForm categories={options.categories} sizeGuides={options.sizeGuides} />
    </>
  );
}
