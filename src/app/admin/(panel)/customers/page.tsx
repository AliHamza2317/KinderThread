import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState, PageHeader, StatCard, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { statsForUsers } from "@/components/admin/sales/customer-stats";
import { SEGMENT_HINT, SEGMENT_LABEL, SEGMENT_TONE, segmentFor, type Segment } from "@/components/admin/sales/labels";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

const PER_PAGE = 30;
const SEGMENTS = Object.keys(SEGMENT_LABEL) as Segment[];

type SP = { q?: string; segment?: string; view?: string; page?: string; tag?: string };

function qs(sp: SP, over: Partial<SP>) {
  const p = new URLSearchParams();
  const m = { ...sp, ...over };
  for (const [k, v] of Object.entries(m)) if (v && !(k === "page" && v === "1")) p.set(k, v);
  const s = p.toString();
  return `/admin/customers${s ? `?${s}` : ""}`;
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireStaff();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const view = sp.view === "guests" ? "guests" : "accounts";

  const tabs = (
    <nav className="-mx-1 mb-5 flex gap-1" aria-label="Customer type">
      {[
        { key: "accounts", label: "Registered customers" },
        { key: "guests", label: "Guest checkouts" },
      ].map((t) => (
        <Link
          key={t.key}
          href={qs({ q: sp.q }, { view: t.key === "guests" ? "guests" : undefined })}
          className={cn("rounded-full px-4 py-2 text-sm font-semibold", view === t.key ? "bg-cocoa text-cream-50" : "text-cocoa-600 hover:bg-cocoa-50")}
          aria-current={view === t.key ? "page" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );

  const searchForm = (
    <form method="get" className="mb-6 flex flex-wrap gap-2" role="search">
      {view === "guests" && <input type="hidden" name="view" value="guests" />}
      {sp.segment && <input type="hidden" name="segment" value={sp.segment} />}
      <label className="relative min-w-[240px] flex-1">
        <span className="sr-only">Search customers</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
        <Input name="q" defaultValue={q} placeholder={view === "guests" ? "Name, phone or email" : "Name, email, phone or tag"} className="pl-10" />
      </label>
      <button className={buttonClass("primary", "md")}>Search</button>
      {q && (
        <Link href={qs({ view: sp.view, segment: sp.segment }, {})} className={buttonClass("ghost", "md")}>
          Clear
        </Link>
      )}
    </form>
  );

  if (view === "guests") {
    const where: Prisma.OrderWhereInput = {
      userId: null,
      status: { not: "CANCELLED" },
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q.replace(/\D/g, "").replace(/^92/, "").replace(/^0/, "") || q } },
            ],
          }
        : {}),
    };
    const groups = await db.order.groupBy({
      by: ["email"],
      where,
      _count: { _all: true },
      _sum: { total: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: 300,
    });
    const latest = groups.length
      ? await db.order.findMany({
          where: { userId: null, email: { in: groups.map((g) => g.email) } },
          orderBy: { createdAt: "desc" },
          distinct: ["email"],
          select: { email: true, customerName: true, phone: true, city: true },
        })
      : [];
    const info = new Map(latest.map((l) => [l.email, l]));
    return (
      <>
        <PageHeader title="Customers" description="People who checked out without creating an account, grouped by email." />
        {tabs}
        {searchForm}
        {groups.length === 0 ? (
          <EmptyState title="No guest customers" body="Guest checkouts will be grouped here by email address." />
        ) : (
          <div className="rounded-2xl border border-cocoa-100 bg-white/70 p-5">
            <TableWrap>
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Customer</th>
                    <th className={thCls}>City</th>
                    <th className={cn(thCls, "text-right")}>Orders</th>
                    <th className={cn(thCls, "text-right")}>Spend</th>
                    <th className={thCls}>Last order</th>
                    <th className={thCls}>Segment</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => {
                    const i = info.get(g.email);
                    const seg = segmentFor(g._count._all, g._sum.total ?? 0, g._max.createdAt ?? null);
                    return (
                      <tr key={g.email} className="hover:bg-cream-100/70">
                        <td className={tdCls}>
                          <Link href={`/admin/orders?q=${encodeURIComponent(g.email)}`} className="font-semibold hover:underline">
                            {i?.customerName ?? g.email}
                          </Link>
                          <p className="text-[0.78rem] text-cocoa-500">
                            {g.email} · {i?.phone}
                          </p>
                        </td>
                        <td className={cn(tdCls, "text-cocoa-600")}>{i?.city}</td>
                        <td className={cn(tdCls, "text-right tabular-nums")}>{g._count._all}</td>
                        <td className={cn(tdCls, "text-right font-semibold tabular-nums")}>{formatPrice(g._sum.total ?? 0)}</td>
                        <td className={cn(tdCls, "whitespace-nowrap text-cocoa-600")}>{g._max.createdAt ? formatDate(g._max.createdAt) : "—"}</td>
                        <td className={tdCls}>
                          <Badge tone={SEGMENT_TONE[seg]}>{SEGMENT_LABEL[seg]}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          </div>
        )}
      </>
    );
  }

  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { tags: { has: q.toLowerCase() } },
          ],
        }
      : {}),
    ...(sp.tag ? { tags: { has: sp.tag } } : {}),
  };
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, tags: true, isActive: true, createdAt: true },
  });
  const stats = await statsForUsers(users.map((u) => u.id));
  const segment = sp.segment && SEGMENTS.includes(sp.segment as Segment) ? (sp.segment as Segment) : undefined;
  const segCounts = Object.fromEntries(SEGMENTS.map((s) => [s, 0])) as Record<Segment, number>;
  users.forEach((u) => segCounts[stats.get(u.id)!.segment]++);
  const filtered = segment ? users.filter((u) => stats.get(u.id)!.segment === segment) : users;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <PageHeader title="Customers" description="Registered customers, their orders and segments." />
      {tabs}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {SEGMENTS.map((s) => (
          <Link key={s} href={qs({ q: sp.q }, { segment: segment === s ? undefined : s })} className={cn("rounded-2xl transition", segment === s && "ring-2 ring-cocoa ring-offset-2 ring-offset-cream")} aria-pressed={segment === s}>
            <StatCard label={SEGMENT_LABEL[s]} value={segCounts[s]} hint={SEGMENT_HINT[s]} tone={s === "VIP" ? "coral" : s === "REPEAT" ? "sage" : s === "INACTIVE" ? "neutral" : "sun"} />
          </Link>
        ))}
      </div>
      {searchForm}
      {sp.tag && (
        <p className="mb-4 text-sm">
          Tagged <Badge tone="neutral">{sp.tag}</Badge>{" "}
          <Link href={qs({ q: sp.q, segment: sp.segment }, {})} className="ml-2 font-semibold text-sage-700 hover:underline">
            Clear tag
          </Link>
        </p>
      )}
      {rows.length === 0 ? (
        <EmptyState title={q || segment || sp.tag ? "No customers match" : "No registered customers yet"} body={q || segment || sp.tag ? "Try a different search or segment." : "Customers who create an account will appear here."} />
      ) : (
        <div className="rounded-2xl border border-cocoa-100 bg-white/70 p-5">
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Customer</th>
                  <th className={cn(thCls, "text-right")}>Orders</th>
                  <th className={cn(thCls, "text-right")}>Spend</th>
                  <th className={thCls}>Last order</th>
                  <th className={thCls}>Segment</th>
                  <th className={thCls}>Tags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const s = stats.get(u.id)!;
                  return (
                    <tr key={u.id} className="hover:bg-cream-100/70">
                      <td className={tdCls}>
                        <Link href={`/admin/customers/${u.id}`} className="font-semibold hover:underline">
                          {u.name}
                        </Link>
                        {!u.isActive && (
                          <Badge tone="out" className="ml-2">
                            Disabled
                          </Badge>
                        )}
                        <p className="text-[0.78rem] text-cocoa-500">
                          {u.email}
                          {u.phone && ` · ${u.phone}`}
                        </p>
                      </td>
                      <td className={cn(tdCls, "text-right tabular-nums")}>{s.orders}</td>
                      <td className={cn(tdCls, "text-right font-semibold tabular-nums")}>{formatPrice(s.spend)}</td>
                      <td className={cn(tdCls, "whitespace-nowrap text-cocoa-600")}>{s.lastOrder ? formatDate(s.lastOrder) : "—"}</td>
                      <td className={tdCls}>
                        <Badge tone={SEGMENT_TONE[s.segment]}>{SEGMENT_LABEL[s.segment]}</Badge>
                      </td>
                      <td className={tdCls}>
                        <div className="flex flex-wrap gap-1">
                          {u.tags.map((t) => (
                            <Link key={t} href={qs({}, { tag: t })} className="rounded-full bg-cocoa-50 px-2 py-0.5 text-[0.72rem] font-semibold text-cocoa-600 hover:bg-cocoa-100">
                              {t}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
          {pages > 1 && (
            <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
              <span className="text-cocoa-500">
                Page {page} of {pages} · {filtered.length} customers
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link className={buttonClass("secondary", "sm")} href={qs(sp, { page: String(page - 1) })}>
                    Previous
                  </Link>
                )}
                {page < pages && (
                  <Link className={buttonClass("secondary", "sm")} href={qs(sp, { page: String(page + 1) })}>
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
