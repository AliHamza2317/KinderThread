import type { Metadata } from "next";
import { CartPageClient } from "@/components/checkout/cart-page";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function CartPage() {
  const s = await getSettings();
  return (
    <>
      <CartPageClient freeThreshold={s.shipping.freeThreshold} />
      <RecentlyViewed showSample={s.features.showSampleBadges} />
    </>
  );
}
