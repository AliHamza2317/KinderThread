import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { PageEditor } from "@/components/admin/content/page-editor";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "New page" };

export default async function NewPage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="New page" back={{ href: "/admin/pages", label: "Pages" }} />
      <PageEditor page={{ title: "", slug: "", body: "", seoDescription: "", isPublished: true, showInFooter: true }} />
    </>
  );
}
