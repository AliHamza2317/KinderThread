"use server";

import { z } from "zod";
import { CATEGORIES } from "@/data/catalog";
import { getProductsByIds, listProducts, type ProductCardData } from "@/lib/catalog";
import { quoteCart, type CartQuote } from "@/lib/pricing";

const linesSchema = z
  .array(z.object({ variantId: z.string().min(1).max(60), quantity: z.number().int().min(0).max(50) }))
  .max(60);

export async function quoteCartAction(
  lines: { variantId: string; quantity: number }[],
  couponCode?: string,
  paymentMethod?: string,
): Promise<CartQuote> {
  const parsed = linesSchema.parse(lines);
  return quoteCart(parsed, { couponCode: couponCode?.slice(0, 40), paymentMethod: paymentMethod?.slice(0, 20) });
}

export async function searchAction(q: string): Promise<{ products: ProductCardData[]; total: number; categories: { name: string; slug: string }[] }> {
  const query = q.trim().slice(0, 80);
  if (query.length < 2) return { products: [], total: 0, categories: [] };
  const res = await listProducts({ q: query, page: 1 });
  const categories = CATEGORIES.filter((c) => c.isVisible && c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map((c) => ({ name: c.name, slug: c.slug }));
  return { products: res.products.slice(0, 6), total: res.total, categories };
}

export async function productsByIdsAction(ids: string[]) {
  const clean = z.array(z.string().max(80)).max(60).parse(ids);
  return getProductsByIds(clean);
}

export type SubscribeState = { ok: boolean; message: string } | null;

const subscribeSchema = z.object({
  email: z.email("Please enter a valid email address.").max(160),
  source: z.enum(["NEWSLETTER", "LAUNCH", "TRYON"]).default("NEWSLETTER"),
});

/** Validates the sign-up. Frontend-only build: nothing is stored yet. */
export async function subscribeAction(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  if (formData.get("company")) return { ok: true, message: "Thank you!" };
  const parsed = subscribeSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    source: formData.get("source") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your email." };
  const messages = {
    NEWSLETTER: "Thank you for subscribing! (Preview: sign-ups are saved once the backend is connected.)",
    LAUNCH: "You're on the list! (Preview: sign-ups are saved once the backend is connected.)",
    TRYON: "Thanks! (Preview: sign-ups are saved once the backend is connected.)",
  } as const;
  return { ok: true, message: messages[parsed.data.source] };
}
