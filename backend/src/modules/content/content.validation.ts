import { z } from "zod";
import { optionalLink, optionalText, safeLink, slug } from "../../lib/fields.js";

/** Page slugs that would clash with the store's own routes. */
const RESERVED_PAGE_SLUGS = ["admin", "account", "api", "cart", "checkout", "shop", "search", "products", "collections", "wishlist", "size-guide", "track-order"];

export const pageInput = z.object({
  slug: slug.refine((s) => !RESERVED_PAGE_SLUGS.includes(s), "That address is used by the store — choose another."),
  title: z.string().trim().min(2, "Add a title.").max(120),
  body: z.string().max(50_000).default(""),
  seoDescription: optionalText(320),
  isPublished: z.boolean().default(true),
  showInFooter: z.boolean().default(true),
});

export const bannerInput = z.object({
  eyebrow: optionalText(60),
  title: z.string().trim().min(2, "Add a title.").max(120),
  subtitle: optionalText(200),
  image: optionalLink,
  ctaLabel: optionalText(40),
  ctaHref: optionalLink,
  tone: z.string().trim().max(20).default("cream"),
  sortOrder: z.number().int().min(-1000).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export const galleryImageInput = z.object({
  url: safeLink,
  alt: z.string().trim().max(200).default(""),
  href: optionalLink,
  isSample: z.boolean().default(false),
  sortOrder: z.number().int().min(-1000).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export type PageInput = z.infer<typeof pageInput>;
export type BannerInput = z.infer<typeof bannerInput>;
export type GalleryImageInput = z.infer<typeof galleryImageInput>;
