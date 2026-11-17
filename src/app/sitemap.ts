import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE", isSample: false }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/collections"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/size-guide"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/track-order"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...Object.keys(VIRTUAL_COLLECTIONS).map((slug) => ({ url: absoluteUrl(`/collections/${slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...categories.map((c) => ({ url: absoluteUrl(`/collections/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...pages.map((p) => ({ url: absoluteUrl(p.slug === "about" ? "/about" : `/pages/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
