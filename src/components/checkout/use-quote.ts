"use client";

import { useEffect, useState } from "react";
import { quoteCartAction } from "@/actions/storefront";
import type { CartQuote } from "@/lib/pricing";
import { useCart } from "@/stores/cart";

/** Server-priced quote for the current bag, refreshed when the bag/coupon/payment changes. */
export function useQuote(payment?: string) {
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.couponCode);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify([lines.map((l) => [l.variantId, l.quantity]), coupon, payment]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      quoteCartAction(
        lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        coupon || undefined,
        payment,
      )
        .then((q) => alive && setQuote(q))
        .catch(() => {})
        .finally(() => alive && setLoading(false));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { quote, loading };
}
