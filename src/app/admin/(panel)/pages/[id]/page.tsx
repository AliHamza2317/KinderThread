import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deletePageAction } from "@/actions/admin/content-pages";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { PageHeader } from "@/components/admin/ui";
import { PageEditor } from "@/components/admin/content/page-editor";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit page" };

const CORE = ["shipping", "returns", "faq", "contact", "privacy", "terms", "about"];

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();
  const core = CORE.includes(page.slug);
  return (
    <>
      <PageHeader
        title={page.title}
        back={{ href: "/admin/pages", label: "Pages" }}
        actions={
          !core && (
            <form action={deletePageAction}>
              <input type="hidden" name="id" value={page.id} />
              <ConfirmSubmit message={`Delete “${page.title}”? Visitors will no longer be able to open it.`}>Delete page</ConfirmSubmit>
            </form>
          )
        }
      />
      {sp.created && <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800">Page created.</p>}
      <PageEditor page={page} slugLocked={core} />
    </>
  );
}
