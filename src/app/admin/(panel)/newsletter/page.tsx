import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { deleteSubscriberAction, setSubscriberActiveAction } from "@/actions/admin/content-newsletter";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/form-bits";
import { Card, EmptyState, PageHeader, StatCard, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth";
import { SUBSCRIBERS } from "@/data/admin";
import { DemoNotice } from "@/components/admin/demo-notice";
import { formatDate } from "@/lib/utils";
import { SOURCES, filterQuery, filterSubscribers, parseSubscriberFilters } from "./query";

export const metadata: Metadata = { title: "Subscribers" };

const PAGE = 50;

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireStaff();
  const sp = await searchParams;
  const filters = parseSubscriberFilters(sp);
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const matching = filterSubscribers(SUBSCRIBERS, filters);
  const total = matching.length;
  const rows = matching.slice((page - 1) * PAGE, page * PAGE);
  const countFor = (id: string) => SUBSCRIBERS.filter((s) => s.isActive && s.source === id).length;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="Newsletter sign-ups, the launch list and try-on interest. Export to CSV to import into your email tool."
        actions={
          <a href={`/admin/newsletter/export${filterQuery(filters)}`} className={buttonClass("secondary", "sm")}>
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />
      <DemoNotice show={sp.demo === "1"} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SOURCES.map((s, i) => (
          <StatCard key={s.id} label={s.label} value={countFor(s.id)} hint="active" tone={(["sage", "sun", "coral", "neutral"] as const)[i]} href={`/admin/newsletter?source=${s.id}`} />
        ))}
      </div>

      <Card>
        <form className="mb-5 flex flex-col gap-3 md:flex-row md:items-end" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
            <label htmlFor="sub-q" className="sr-only">
              Search by email
            </label>
            <Input id="sub-q" name="q" defaultValue={filters.q} placeholder="Search by email" className="pl-10" />
          </div>
          <label htmlFor="sub-source" className="sr-only">
            Source
          </label>
          <Select id="sub-source" name="source" defaultValue={filters.source ?? ""} className="md:w-48">
            <option value="">All sources</option>
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
          <label htmlFor="sub-status" className="sr-only">
            Status
          </label>
          <Select id="sub-status" name="status" defaultValue={filters.status ?? ""} className="md:w-40">
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Unsubscribed</option>
          </Select>
          <button className={buttonClass("primary", "md")}>Filter</button>
          {(filters.q || filters.source || filters.status) && (
            <Link href="/admin/newsletter" className="self-center text-sm font-semibold text-cocoa-500 hover:text-cocoa">
              Clear
            </Link>
          )}
        </form>

        {rows.length === 0 ? (
          <EmptyState title="No subscribers found" body={filters.q || filters.source || filters.status ? "Try changing the filters." : "Sign-ups from the newsletter, coming-soon page and try-on page will appear here."} />
        ) : (
          <>
            <p className="mb-2 text-[0.8rem] text-cocoa-500">
              {total} subscriber{total === 1 ? "" : "s"}
            </p>
            <TableWrap>
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Email</th>
                    <th className={thCls}>Source</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls}>Joined</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className={`${tdCls} font-semibold`}>{r.email}</td>
                      <td className={tdCls}>{SOURCES.find((s) => s.id === r.source)?.label}</td>
                      <td className={tdCls}>
                        <Badge tone={r.isActive ? "success" : "neutral"}>{r.isActive ? "Active" : "Unsubscribed"}</Badge>
                      </td>
                      <td className={`${tdCls} text-cocoa-500`}>{formatDate(r.createdAt)}</td>
                      <td className={tdCls}>
                        <div className="flex justify-end gap-1">
                          <form action={setSubscriberActiveAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="active" value={r.isActive ? "false" : "true"} />
                            <SubmitButton size="sm" variant="ghost">
                              {r.isActive ? "Unsubscribe" : "Reactivate"}
                            </SubmitButton>
                          </form>
                          <form action={deleteSubscriberAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <ConfirmSubmit variant="ghost" message={`Permanently delete ${r.email}?`} className="text-coral-700">
                              Delete
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            {pages > 1 && (
              <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
                {page > 1 ? (
                  <Link className="font-semibold text-sage-700" href={`/admin/newsletter${filterQuery(filters, { page: String(page - 1) })}`}>
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-cocoa-500">
                  Page {page} of {pages}
                </span>
                {page < pages ? (
                  <Link className="font-semibold text-sage-700" href={`/admin/newsletter${filterQuery(filters, { page: String(page + 1) })}`}>
                    Next →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </Card>
    </>
  );
}
