import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { RETURN_STATUS_LABEL, RETURN_STATUS_TONE, RETURN_TYPE_LABEL } from "@/components/admin/sales/labels";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { ORDERS, RETURNS } from "@/data/admin";
import { cn, formatDate } from "@/lib/utils";
import { RETURN_STATUSES, type ReturnStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Returns & exchanges" };

const OPEN: ReturnStatus[] = ["REQUESTED", "APPROVED", "RECEIVED"];

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const filter = sp.status === "all" ? "all" : sp.status && (RETURN_STATUSES as readonly string[]).includes(sp.status) ? (sp.status as ReturnStatus) : "open";
  const requests = RETURNS.filter((r) => (filter === "all" ? true : filter === "open" ? OPEN.includes(r.status) : r.status === filter))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 200)
    .flatMap((r) => {
      const order = ORDERS.find((o) => o.id === r.orderId);
      return order ? [{ ...r, order }] : [];
    });
  const counts: Partial<Record<ReturnStatus, number>> = {};
  for (const r of RETURNS) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const openCount = OPEN.reduce((n, s) => n + (counts[s] ?? 0), 0);
  const all = RETURNS.length;

  const tabs: { key: string; label: string; n: number }[] = [
    { key: "open", label: "Open", n: openCount },
    ...RETURN_STATUSES.map((s) => ({ key: s, label: RETURN_STATUS_LABEL[s], n: counts[s] ?? 0 })),
    { key: "all", label: "All", n: all },
  ];

  return (
    <>
      <PageHeader title="Returns & exchanges" description="Requests customers submit from their account, plus any you log for them." />
      <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-1" aria-label="Filter by status">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "open" ? "/admin/returns" : `/admin/returns?status=${t.key}`}
            className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition", filter === t.key ? "bg-cocoa text-cream-50" : "text-cocoa-600 hover:bg-cocoa-50")}
            aria-current={filter === t.key ? "page" : undefined}
          >
            {t.label}
            <span className={cn("rounded-full px-1.5 text-[0.7rem] tabular-nums", filter === t.key ? "bg-cream-50/20" : "bg-cocoa-50")}>{t.n}</span>
          </Link>
        ))}
      </nav>

      {requests.length === 0 ? (
        <EmptyState title={filter === "open" ? "No open requests" : "Nothing here"} body="When customers ask to return or exchange a delivered item, their request will show up here." />
      ) : (
        <div className="rounded-xl border border-[var(--adm-line)] bg-white shadow-[0_1px_2px_rgb(20_16_12/0.04)] p-5">
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Requested</th>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Order</th>
                  <th className={thCls}>Customer</th>
                  <th className={thCls}>Reason</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-100/70">
                    <td className={cn(tdCls, "whitespace-nowrap text-cocoa-600")}>{formatDate(r.createdAt)}</td>
                    <td className={tdCls}>
                      <Badge tone={r.type === "EXCHANGE" ? "info" : "neutral"}>{RETURN_TYPE_LABEL[r.type]}</Badge>
                    </td>
                    <td className={tdCls}>
                      <Link href={`/admin/orders/${r.order.id}`} className="font-semibold hover:underline">
                        {r.order.number}
                      </Link>
                    </td>
                    <td className={tdCls}>
                      <p className="font-semibold">{r.order.customerName}</p>
                      <p className="text-[0.78rem] text-cocoa-500">{r.order.phone}</p>
                    </td>
                    <td className={cn(tdCls, "max-w-[240px]")}>
                      <p className="truncate">{r.reason}</p>
                      {r.details && <p className="truncate text-[0.78rem] text-cocoa-500">{r.details}</p>}
                    </td>
                    <td className={tdCls}>
                      <Badge tone={RETURN_STATUS_TONE[r.status]}>{RETURN_STATUS_LABEL[r.status]}</Badge>
                    </td>
                    <td className={cn(tdCls, "text-right")}>
                      <Link href={`/admin/returns/${r.id}`} className="font-semibold text-sage-700 hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </div>
      )}
    </>
  );
}
