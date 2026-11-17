import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/shop/track-order";

export const metadata: Metadata = { title: "Track your order", description: "Check the status of your Kinder Thread order." };

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <TrackOrderClient initialOrder={order?.slice(0, 20) ?? ""} />;
}
