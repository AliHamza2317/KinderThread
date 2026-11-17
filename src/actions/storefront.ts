"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getProductsByIds, listProducts, type ProductCardData } from "@/lib/catalog";
import { quoteCart, type CartQuote } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

const linesSchema = z
  .array(z.object({ variantId: z.string().min(1).max(40), quantity: z.number().int().min(0).max(50) }))
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
  const [res, categories] = await Promise.all([
    listProducts({ q: query, page: 1 }),
    db.category.findMany({
      where: { isVisible: true, name: { contains: query, mode: "insensitive" } },
      select: { name: true, slug: true },
      take: 4,
    }),
  ]);
  return { products: res.products.slice(0, 6), total: res.total, categories };
}

export async function productsByIdsAction(ids: string[]) {
  const clean = z.array(z.string().max(40)).max(60).parse(ids);
  return getProductsByIds(clean);
}

export type SubscribeState = { ok: boolean; message: string } | null;

const subscribeSchema = z.object({
  email: z.email("Please enter a valid email address.").max(160),
  source: z.enum(["NEWSLETTER", "LAUNCH", "TRYON"]).default("NEWSLETTER"),
});

export async function subscribeAction(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  // honeypot: bots fill every field
  if (formData.get("company")) return { ok: true, message: "Thank you!" };
  const limited = await rateLimit("subscribe", 8, 60_000);
  if (!limited.ok) return { ok: false, message: "Too many attempts — please try again in a minute." };
  const parsed = subscribeSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    source: formData.get("source") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your email." };
  const { email, source } = parsed.data;
  const existing = await db.subscriber.findUnique({ where: { email_source: { email, source } } });
  if (existing?.isActive) {
    return { ok: true, message: source === "NEWSLETTER" ? "You're already part of our little world. 💛" : "You're already on the list — we'll be in touch." };
  }
  await db.subscriber.upsert({
    where: { email_source: { email, source } },
    create: { email, source },
    update: { isActive: true },
  });
  const messages = {
    NEWSLETTER: "Welcome to our little world! Look out for our next letter.",
    LAUNCH: "You're on the list! We'll email you the moment we open.",
    TRYON: "Thanks! We'll let you know when virtual try-on is ready.",
  } as const;
  return { ok: true, message: messages[source] };
}

/* ------------------------------ wishlist sync ----------------------------- */

export async function syncWishlistAction(localIds: string[]): Promise<string[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const ids = z.array(z.string().max(40)).max(200).parse(localIds);
  if (ids.length) {
    const valid = await db.product.findMany({ where: { id: { in: ids } }, select: { id: true } });
    await db.wishlistItem.createMany({
      data: valid.map((p) => ({ userId: user.id, productId: p.id })),
      skipDuplicates: true,
    });
  }
  const rows = await db.wishlistItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { productId: true } });
  return rows.map((r) => r.productId);
}

export async function setWishlistItemAction(productId: string, on: boolean) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const id = z.string().max(40).parse(productId);
  if (on) {
    const exists = await db.product.findUnique({ where: { id }, select: { id: true } });
    if (exists) await db.wishlistItem.upsert({ where: { userId_productId: { userId: user.id, productId: id } }, create: { userId: user.id, productId: id }, update: {} });
  } else {
    await db.wishlistItem.deleteMany({ where: { userId: user.id, productId: id } });
  }
  return { ok: true };
}
