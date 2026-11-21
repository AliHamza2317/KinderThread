import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Thank you for your order", robots: { index: false } };

export default async function OrderSuccess({ params }: { params: Promise<{ number: string }> }) {
  const [{ number }, settings] = await Promise.all([params, getSettings()]);
  return <OrderConfirmation number={decodeURIComponent(number)} whatsapp={settings.store.whatsapp} />;
}
