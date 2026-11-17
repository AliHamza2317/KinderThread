import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/sales/coupon-form";
import { COUPON_STATE_TONE, couponState } from "@/components/admin/sales/labels";
import { Badge } from "@/components/ui/badge";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit coupon" };

/** yyyy-mm-dd in server local time, matching how the action parses dates */
const day = (d: Date | null) => {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default async function EditCoupon({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const c = await db.coupon.findUnique({ where: { id } });
  if (!c) notFound();
  const state = couponState(c);
  return (
    <>
      <PageHeader back={{ href: "/admin/coupons", label: "Coupons" }} title={c.code} description={<Badge tone={COUPON_STATE_TONE[state]}>{state}</Badge>} />
      <CouponForm
        coupon={{
          id: c.id,
          code: c.code,
          description: c.description,
          type: c.type,
          value: c.value,
          minSubtotal: c.minSubtotal,
          maxUses: c.maxUses,
          startsAt: day(c.startsAt),
          endsAt: day(c.endsAt),
          isActive: c.isActive,
          usedCount: c.usedCount,
        }}
      />
    </>
  );
}
