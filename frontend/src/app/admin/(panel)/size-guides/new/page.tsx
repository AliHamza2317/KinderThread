import type { Metadata } from "next";
import { SizeGuideForm } from "@/components/admin/catalog/size-guide-form";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "New size guide" };

export default async function NewSizeGuidePage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="New size guide" back={{ href: "/admin/size-guides", label: "Size guides" }} />
      <SizeGuideForm />
    </>
  );
}
