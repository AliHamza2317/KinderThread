import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/catalog/category-form";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "New category" };

export default async function NewCategoryPage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="New category" back={{ href: "/admin/categories", label: "Categories" }} />
      <CategoryForm />
    </>
  );
}
