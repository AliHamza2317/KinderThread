import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/sales/coupon-form";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "New coupon" };

export default async function NewCoupon() {
  await requireStaff();
  return (
    <>
      <PageHeader back={{ href: "/admin/coupons", label: "Coupons" }} title="New coupon" />
      <CouponForm />
    </>
  );
}
