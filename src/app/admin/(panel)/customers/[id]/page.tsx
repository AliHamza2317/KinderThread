import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EmptyState, OrderStatusBadge, PageHeader, StatCard, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { ActiveToggle, TagsForm } from "@/components/admin/sales/customer-forms";
import { statsForUsers } from "@/components/admin/sales/customer-stats";
import { SEGMENT_HINT, SEGMENT_LABEL, SEGMENT_TONE } from "@/components/admin/sales/labels";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatDate, formatPrice, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const user = await db.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: { orderBy: { createdAt: "desc" }, take: 50, include: { items: { select: { quantity: true } } } },
      _count: { select: { wishlist: true, orders: true } },
    },
  });
  if (!user) notFound();
  const stats = (await statsForUsers([user.id])).get(user.id)!;
  const returns = await db.returnRequest.count({ where: { order: { userId: user.id } } });
  const avg = stats.orders ? Math.round(stats.spend / stats.orders) : 0;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={user.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Customer since {formatDate(user.createdAt)}
            <Badge tone={SEGMENT_TONE[stats.segment]}>{SEGMENT_LABEL[stats.segment]}</Badge>
            {!user.isActive && <Badge tone="out">Disabled</Badge>}
          </span>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Orders" value={stats.orders} hint={user._count.orders !== stats.orders ? `${user._count.orders - stats.orders} cancelled` : undefined} />
        <StatCard label="Total spend" value={formatPrice(stats.spend)} tone="sage" hint={SEGMENT_HINT[stats.segment]} />
        <StatCard label="Average order" value={formatPrice(avg)} tone="sun" />
        <StatCard label="Wishlist · returns" value={`${user._count.wishlist} · ${returns}`} tone="coral" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card title="Orders">
          {user.orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <TableWrap>
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Order</th>
                    <th className={thCls}>Date</th>
                    <th className={cn(thCls, "text-right")}>Items</th>
                    <th className={cn(thCls, "text-right")}>Total</th>
                    <th className={thCls}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream-100/70">
                      <td className={tdCls}>
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">
                          {o.number}
                        </Link>
                      </td>
                      <td className={cn(tdCls, "text-cocoa-600")}>{formatDate(o.createdAt)}</td>
                      <td className={cn(tdCls, "text-right tabular-nums")}>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                      <td className={cn(tdCls, "text-right font-semibold tabular-nums")}>{formatPrice(o.total)}</td>
                      <td className={tdCls}>
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Contact">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-cocoa-500">Email</dt>
                <dd>
                  <a href={`mailto:${user.email}`} className="font-semibold hover:underline">
                    {user.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-cocoa-500">Phone</dt>
                <dd className="font-semibold">
                  {user.phone ? (
                    <a href={whatsappLink(user.phone)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {user.phone} (WhatsApp)
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-cocoa-500">Last sign-in</dt>
                <dd>{user.lastLoginAt ? formatDate(user.lastLoginAt, { dateStyle: "medium", timeStyle: "short" }) : "—"}</dd>
              </div>
            </dl>
          </Card>
          <Card title="Segment tags">
            <TagsForm userId={user.id} tags={user.tags} />
          </Card>
          <Card title="Saved addresses">
            {user.addresses.length === 0 ? (
              <p className="text-sm text-cocoa-500">No saved addresses.</p>
            ) : (
              <ul className="flex flex-col gap-4 text-sm">
                {user.addresses.map((a) => (
                  <li key={a.id} className="rounded-xl bg-cream-100 p-3">
                    <p className="font-semibold">
                      {a.label || a.fullName} {a.isDefault && <Badge tone="success">Default</Badge>}
                    </p>
                    <p className="mt-1 leading-relaxed text-cocoa-600">
                      {a.fullName} · {a.phone}
                      <br />
                      {a.line1}
                      {a.line2 && `, ${a.line2}`}
                      <br />
                      {a.city}
                      {a.postalCode && ` ${a.postalCode}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Account access" description={user.isActive ? "The customer can sign in and see their orders." : "Sign-in is blocked for this account."}>
            <ActiveToggle userId={user.id} active={user.isActive} name={user.name} />
          </Card>
        </div>
      </div>
    </>
  );
}
