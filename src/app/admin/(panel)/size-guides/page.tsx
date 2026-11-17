import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, EmptyState, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Size guides" };

export default async function SizeGuidesPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireStaff();
  const { deleted } = await searchParams;
  const guides = await db.sizeGuide.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });
  return (
    <>
      <PageHeader
        title="Size guides"
        description="Measurement tables shown on product pages. Products without their own guide use the default."
        actions={
          <ButtonLink href="/admin/size-guides/new">
            <Plus className="h-4 w-4" /> Add size guide
          </ButtonLink>
        }
      />
      {deleted && (
        <p className="mb-6 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800" role="status">
          Size guide deleted.
        </p>
      )}
      <Card>
        {guides.length === 0 ? (
          <EmptyState title="No size guides yet" body="Add your supplier's measurements so parents can choose the right size." action={<ButtonLink href="/admin/size-guides/new">Add size guide</ButtonLink>} />
        ) : (
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Sizes</th>
                  <th className={thCls}>Products</th>
                  <th className={thCls}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((g) => {
                  const rows = Array.isArray(g.rows) ? (g.rows as { size?: string }[]) : [];
                  return (
                    <tr key={g.id} className="hover:bg-cream-100/60">
                      <td className={tdCls}>
                        <Link href={`/admin/size-guides/${g.id}`} className="font-semibold hover:underline">
                          {g.name}
                        </Link>{" "}
                        {g.isDefault && <Badge tone="success">Default</Badge>}
                      </td>
                      <td className={`${tdCls} text-cocoa-500`}>
                        {rows.length} rows {rows.length > 0 && `· ${rows[0]?.size ?? ""} – ${rows.at(-1)?.size ?? ""}`} ({g.unit})
                      </td>
                      <td className={tdCls}>{g._count.products}</td>
                      <td className={`${tdCls} text-cocoa-500`}>{formatDate(g.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
