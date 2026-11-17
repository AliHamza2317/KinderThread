import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteSizeGuideAction } from "@/actions/admin/catalog";
import { SizeGuideForm, type SizeRow } from "@/components/admin/catalog/size-guide-form";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { PRODUCTS, SIZE_GUIDES } from "@/data/catalog";

export const metadata: Metadata = { title: "Edit size guide" };

function toRows(json: unknown): SizeRow[] {
  if (!Array.isArray(json)) return [];
  return json.map((r) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const s = (k: string) => (o[k] == null ? "" : String(o[k]));
    return { size: s("size"), age: s("age"), height: s("height"), chest: s("chest"), waist: s("waist"), length: s("length") };
  });
}

export default async function EditSizeGuidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const found = SIZE_GUIDES.find((x) => x.id === id);
  if (!found) notFound();
  const g = { ...found, _count: { products: PRODUCTS.filter((p) => p.sizeGuideId === found.id).length } };
  return (
    <>
      <PageHeader
        title={g.name}
        back={{ href: "/admin/size-guides", label: "Size guides" }}
        description={`Used by ${g._count.products} product${g._count.products === 1 ? "" : "s"}${g.isDefault ? " · default for all other products" : ""}`}
        actions={
          <form action={deleteSizeGuideAction}>
            <input type="hidden" name="id" value={g.id} />
            <ConfirmSubmit message={`Delete “${g.name}”? Products using it will fall back to the default guide.`}>Delete</ConfirmSubmit>
          </form>
        }
      />
      <SizeGuideForm key={g.updatedAt.toISOString()} guide={{ id: g.id, name: g.name, unit: g.unit, notes: g.notes, isDefault: g.isDefault, rows: toRows(g.rows) }} />
    </>
  );
}
