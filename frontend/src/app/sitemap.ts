import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { PAGES_DATA } from "@/data/content";
import { VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/collections"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/size-guide"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...Object.keys(VIRTUAL_COLLECTIONS).map((slug) => ({ url: absoluteUrl(`/collections/${slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...CATEGORIES.filter((c) => c.isVisible).map((c) => ({ url: absoluteUrl(`/collections/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    // sample products are excluded until real products exist
    ...PRODUCTS.filter((p) => p.status === "ACTIVE" && !p.isSample).map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...PAGES_DATA.filter((p) => p.isPublished).map((p) => ({ url: absoluteUrl(p.slug === "about" ? "/about" : `/pages/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
