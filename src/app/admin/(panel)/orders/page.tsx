import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { EmptyState, OrderStatusBadge, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { filterOrders, filtersToQuery, parseOrderFilters } from "@/components/admin/sales/order-query";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE } from "@/components/admin/sales/labels";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth";
import { ORDERS } from "@/data/admin";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

const PER_PAGE = 25;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireStaff();
  const f = parseOrderFilters(await searchParams);
  const matching = filterOrders(ORDERS, f).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = matching.length;
  const orders = matching.slice((f.page - 1) * PER_PAGE, f.page * PER_PAGE);
  const tabbed = filterOrders(ORDERS, f, { ignoreStatus: true });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const counts: Partial<Record<OrderStatus, number>> = {};
  for (const o of tabbed) counts[o.status] = (counts[o.status] ?? 0) + 1;
  const allCount = tabbed.length;
  const filtered = !!(f.q || f.pay || f.method || f.from || f.to);

  return (
    <>
      <PageHeader
        title="Orders"
        description="Confirm, pack, ship and track every order."
        actions={
          <a href={`/admin/orders/export${filtersToQuery({ ...f, page: 1 })}`} className={buttonClass("secondary", "md")}>
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      {/* status tabs */}
      <nav className="-mx-1 mb-5 flex gap-1 overflow-x-auto pb-1" aria-label="Filter by status">
        {[undefined, ...ORDER_STATUSES].map((s) => {
          const active = f.status === s;
          const n = s ? (counts[s as OrderStatus] ?? 0) : allCount;
          return (
            <Link
              key={s ?? "all"}
              href={`/admin/orders${filtersToQuery({ ...f, status: s as OrderStatus | undefined, page: 1 })}`}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                active ? "bg-cocoa text-cream-50" : "text-cocoa-600 hover:bg-cocoa-50",
              )}
              aria-current={active ? "page" : undefined}
            >
              {s ? ORDER_STATUS_LABEL[s as OrderStatus] : "All"}
              <span className={cn("rounded-full px-1.5 text-[0.7rem] tabular-nums", active ? "bg-cream-50/20" : "bg-cocoa-50")}>{n}</span>
            </Link>
          );
        })}
      </nav>

      {/* filters */}
      <form method="get" className="mb-6 grid items-end gap-3 rounded-2xl border border-cocoa-100 bg-white/70 p-4 md:grid-cols-12" role="search">
        {f.status && <input type="hidden" name="status" value={f.status} />}
        <label className="relative md:col-span-4">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
          <Input name="q" defaultValue={f.q} placeholder="Order no., name, phone, email, city" className="pl-10" />
        </label>
        <label className="md:col-span-2">
          <span className="sr-only">Payment status</span>
          <Select name="pay" defaultValue={f.pay ?? ""}>
            <option value="">Any payment</option>
            {PAYMENT_STATUSES.map((p) => (
              <option key={p} value={p}>
                {PAYMENT_STATUS_LABEL[p as PaymentStatus]}
              </option>
            ))}
          </Select>
        </label>
        <label className="md:col-span-2">
          <span className="sr-only">Payment method</span>
          <Select name="method" defaultValue={f.method ?? ""}>
            <option value="">Any method</option>
            {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-[0.72rem] font-semibold text-cocoa-500">Placed from</span>
          <Input type="date" name="from" defaultValue={f.from} />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-[0.72rem] font-semibold text-cocoa-500">Placed to</span>
          <Input type="date" name="to" defaultValue={f.to} />
        </label>
        <div className="flex gap-2 md:col-span-12">
          <button className={buttonClass("primary", "sm")}>Apply filters</button>
          {filtered && (
            <Link href={`/admin/orders${filtersToQuery({ page: 1, status: f.status })}`} className={buttonClass("ghost", "sm")}>
              Clear
            </Link>
          )}
          <p className="ml-auto self-center text-sm text-cocoa-500">
            {total} order{total === 1 ? "" : "s"}
          </p>
        </div>
      </form>

      {orders.length === 0 ? (
        <EmptyState
          title={filtered || f.status ? "No orders match these filters" : "No orders yet"}
          body={filtered || f.status ? "Try clearing a filter or searching for something else." : "New orders from the store will appear here as soon as they're placed."}
        />
      ) : (
        <div className="rounded-2xl border border-cocoa-100 bg-white/70 p-5">
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Order</th>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Customer</th>
                  <th className={thCls}>City</th>
                  <th className={cn(thCls, "text-right")}>Items</th>
                  <th className={cn(thCls, "text-right")}>Total</th>
                  <th className={thCls}>Payment</th>
                  <th className={thCls}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="group transition-colors hover:bg-cream-100/70">
                    <td className={tdCls}>
                      <Link href={`/admin/orders/${o.id}`} className="font-bold text-cocoa group-hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td className={cn(tdCls, "whitespace-nowrap text-cocoa-600")}>{formatDate(o.createdAt, { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className={tdCls}>
                      <p className="font-semibold">{o.customerName}</p>
                      <p className="text-[0.78rem] text-cocoa-500">
                        {o.phone}
                        {!o.userId && <span className="ml-1.5 text-cocoa-400">· guest</span>}
                      </p>
                    </td>
                    <td className={cn(tdCls, "text-cocoa-600")}>{o.city}</td>
                    <td className={cn(tdCls, "text-right tabular-nums")}>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className={cn(tdCls, "text-right font-semibold tabular-nums")}>{formatPrice(o.total)}</td>
                    <td className={tdCls}>
                      <p className="text-[0.8rem] text-cocoa-600">{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</p>
                      <Badge tone={PAYMENT_STATUS_TONE[o.paymentStatus]} className="mt-1">
                        {PAYMENT_STATUS_LABEL[o.paymentStatus]}
                      </Badge>
                    </td>
                    <td className={tdCls}>
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          {pages > 1 && (
            <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
              <span className="text-cocoa-500">
                Page {f.page} of {pages}
              </span>
              <div className="flex gap-2">
                {f.page > 1 && (
                  <Link className={buttonClass("secondary", "sm")} href={`/admin/orders${filtersToQuery(f, { page: f.page - 1 })}`}>
                    Previous
                  </Link>
                )}
                {f.page < pages && (
                  <Link className={buttonClass("secondary", "sm")} href={`/admin/orders${filtersToQuery(f, { page: f.page + 1 })}`}>
                    Next
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      )}
    </>
  );
}
