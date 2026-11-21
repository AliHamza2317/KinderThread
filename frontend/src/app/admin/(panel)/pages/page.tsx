import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, EmptyState, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { PAGES_DATA } from "@/data/content";
import { DemoNotice } from "@/components/admin/demo-notice";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages" };

const CORE = ["shipping", "returns", "faq", "contact", "privacy", "terms", "about"];

export default async function PagesList({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const pages = [...PAGES_DATA].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <>
      <PageHeader
        title="Pages"
        description="Policies, FAQs and other information pages. Write in simple Markdown — no code needed."
        actions={
          <ButtonLink href="/admin/pages/new" size="sm">
            <Plus className="h-4 w-4" /> New page
          </ButtonLink>
        }
      />
      <DemoNotice show={sp.demo === "1"} />
      <Card>
        {pages.length === 0 ? (
          <EmptyState title="No pages yet" action={<ButtonLink href="/admin/pages/new">Create a page</ButtonLink>} />
        ) : (
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Title</th>
                  <th className={thCls}>URL</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => {
                  const href = p.slug === "about" ? "/about" : `/pages/${p.slug}`;
                  return (
                    <tr key={p.id} className="hover:bg-cream-50">
                      <td className={tdCls}>
                        <Link href={`/admin/pages/${p.id}`} className="font-semibold hover:underline">
                          {p.title}
                        </Link>
                        {CORE.includes(p.slug) && <span className="ml-2 text-[0.72rem] text-cocoa-400">core</span>}
                      </td>
                      <td className={`${tdCls} font-mono text-[0.8rem] text-cocoa-500`}>{href}</td>
                      <td className={tdCls}>
                        <div className="flex flex-wrap gap-1">
                          <Badge tone={p.isPublished ? "success" : "neutral"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                          {p.showInFooter && p.isPublished && <Badge tone="info">Footer</Badge>}
                        </div>
                      </td>
                      <td className={`${tdCls} text-cocoa-500`}>{formatDate(p.updatedAt)}</td>
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
