import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState, PageHeader, TableWrap, tableCls, tdCls, thCls } from "@/components/admin/ui";
import { CouponToggle } from "@/components/admin/sales/coupon-toggle";
import { COUPON_STATE_TONE, COUPON_TYPE_LABEL, couponState } from "@/components/admin/sales/labels";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { COUPONS } from "@/data/admin";
import { DemoNotice } from "@/components/admin/demo-notice";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; demo?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const coupons = [...COUPONS].sort((a, b) => Number(b.isActive) - Number(a.isActive) || b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes customers can apply at checkout."
        actions={
          <ButtonLink href="/admin/coupons/new">
            <Plus className="h-4 w-4" /> New coupon
          </ButtonLink>
        }
      />
      <DemoNotice show={sp.demo === "1"} />
      {(sp.saved || sp.deleted) && (
        <p role="status" className="mb-5 rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-800">
          {sp.deleted ? "Coupon deleted." : "Coupon saved."}
        </p>
      )}
      {coupons.length === 0 ? (
        <EmptyState title="No coupons yet" body="Create a code for a launch offer, a first-order discount or free delivery." action={<ButtonLink href="/admin/coupons/new">Create coupon</ButtonLink>} />
      ) : (
        <div className="rounded-xl border border-[var(--adm-line)] bg-white shadow-[0_1px_2px_rgb(20_16_12/0.04)] p-5">
          <TableWrap>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Code</th>
                  <th className={thCls}>Discount</th>
                  <th className={thCls}>Conditions</th>
                  <th className={thCls}>Schedule</th>
                  <th className={cn(thCls, "text-right")}>Used</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const state = couponState(c);
                  return (
                    <tr key={c.id} className={cn("hover:bg-cream-100/70", sp.saved === c.id && "bg-sage-50")}>
                      <td className={tdCls}>
                        <Link href={`/admin/coupons/${c.id}`} className="font-mono font-bold hover:underline">
                          {c.code}
                        </Link>
                        {c.description && <p className="text-[0.78rem] text-cocoa-500">{c.description}</p>}
                      </td>
                      <td className={tdCls}>
                        {c.type === "PERCENT" ? `${c.value}% off` : c.type === "FIXED" ? `${formatPrice(c.value)} off` : "Free delivery"}
                        <p className="text-[0.75rem] text-cocoa-400">{COUPON_TYPE_LABEL[c.type]}</p>
                      </td>
                      <td className={cn(tdCls, "text-cocoa-600")}>{c.minSubtotal ? `Min. ${formatPrice(c.minSubtotal)}` : "Any order"}</td>
                      <td className={cn(tdCls, "whitespace-nowrap text-[0.82rem] text-cocoa-600")}>
                        {c.startsAt || c.endsAt ? (
                          <>
                            {c.startsAt ? formatDate(c.startsAt) : "Now"} – {c.endsAt ? formatDate(c.endsAt) : "no end"}
                          </>
                        ) : (
                          "Always"
                        )}
                      </td>
                      <td className={cn(tdCls, "text-right tabular-nums")}>
                        {c.usedCount}
                        {c.maxUses != null && <span className="text-cocoa-400"> / {c.maxUses}</span>}
                      </td>
                      <td className={tdCls}>
                        <Badge tone={COUPON_STATE_TONE[state]}>{state}</Badge>
                      </td>
                      <td className={cn(tdCls, "text-right")}>
                        <div className="flex items-center justify-end gap-1">
                          <CouponToggle id={c.id} active={c.isActive} />
                          <Link href={`/admin/coupons/${c.id}`} className="rounded-full px-3 py-1.5 text-[0.82rem] font-semibold text-sage-700 hover:bg-sage-50">
                            Edit
                          </Link>
                        </div>
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
