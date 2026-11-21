import type { Metadata } from "next";
import { WishlistClient } from "@/components/shop/wishlist-client";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const s = await getSettings();
  return <WishlistClient showSample={s.features.showSampleBadges} />;
}
