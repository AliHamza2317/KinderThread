import { z } from "zod";
import { objectId, optionalLink, optionalText, rupees, safeLink, slug } from "../../lib/fields.js";
import { paging } from "../../lib/pagination.js";
import { GENDERS, PRODUCT_STATUSES } from "./product.model.js";

type Gender = (typeof GENDERS)[number];

/** "a,b , c" → ["a", "b", "c"] */
const csv = z
  .string()
  .max(400)
  .optional()
  .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []));

const flag = z
  .string()
  .optional()
  .transform((v) => v === "1" || v === "true");

export const PRODUCT_SORTS = ["featured", "newest", "price-asc", "price-desc", "best"] as const;

/** Shop / collection / search filters, from the query string. */
export const productListQuery = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(90).optional(),
  gender: csv.transform((list) => list.map((g) => g.toUpperCase()).filter((g): g is Gender => (GENDERS as readonly string[]).includes(g))),
  size: csv,
  age: csv,
  color: csv,
  min: z.coerce.number().int().min(0).optional(),
  max: z.coerce.number().int().min(0).optional(),
  inStock: flag,
  sale: flag,
  sort: z.enum(PRODUCT_SORTS).default("featured"),
  ...paging(24),
});

export type ProductListQuery = z.infer<typeof productListQuery>;

export const idsQuery = z.object({
  ids: z
    .string()
    .max(2000)
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(objectId).max(60)),
});

/* ------------------------------ admin input ------------------------------ */

const sku = z
  .string()
  .trim()
  .min(2, "Every variant needs a SKU.")
  .max(60)
  .regex(/^[A-Za-z0-9._-]+$/, "SKUs may only contain letters, numbers, dots, dashes and underscores.");

export const productInput = z
  .object({
    name: z.string().trim().min(2, "Product name is required.").max(140),
    slug: slug.optional(),
    description: z.string().trim().min(10, "Add a short description (10+ characters).").max(6000),
    fabric: optionalText(300),
    care: optionalText(800),
    price: rupees,
    compareAtPrice: rupees.nullable().default(null),
    status: z.enum(PRODUCT_STATUSES).default("DRAFT"),
    gender: z.enum(GENDERS).default("UNISEX"),
    categories: z.array(objectId).max(30).default([]),
    sizeGuide: objectId.nullable().default(null),
    isFeatured: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isSample: z.boolean().default(false),
    sortOrder: z.number().int().min(-1000).max(100000).default(0),
    seoTitle: optionalText(160),
    seoDescription: optionalText(320),
    colors: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Every colour needs a name.").max(40),
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours must be a hex value like #8A9E72."),
        }),
      )
      .max(20)
      .default([]),
    images: z
      .array(
        z.object({
          url: safeLink,
          alt: z.string().trim().max(200).default(""),
          color: z.string().trim().max(40).nullable().default(null),
        }),
      )
      .max(40)
      .default([]),
    variants: z
      .array(
        z.object({
          id: objectId.optional(),
          sku,
          size: z.string().trim().min(1).max(30),
          color: z.string().trim().max(40).nullable().default(null),
          price: rupees.nullable().default(null),
          stock: z.number().int().min(0, "Stock can't be negative.").max(100000),
          isActive: z.boolean().default(true),
        }),
      )
      .max(400)
      .default([]),
  })
  .superRefine((p, ctx) => {
    if (p.compareAtPrice != null && p.compareAtPrice <= p.price) {
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Compare-at price must be higher than the selling price." });
    }
    const colorNames = new Set<string>();
    p.colors.forEach((c, i) => {
      if (colorNames.has(c.name.toLowerCase())) ctx.addIssue({ code: "custom", path: ["colors", i, "name"], message: `Colour ${c.name} is listed twice.` });
      colorNames.add(c.name.toLowerCase());
    });
    const skus = new Set<string>();
    const combos = new Set<string>();
    p.variants.forEach((v, i) => {
      if (skus.has(v.sku.toUpperCase())) ctx.addIssue({ code: "custom", path: ["variants", i, "sku"], message: `SKU ${v.sku} is used twice.` });
      skus.add(v.sku.toUpperCase());
      const combo = `${v.color ?? "-"}|${v.size}`.toLowerCase();
      if (combos.has(combo)) ctx.addIssue({ code: "custom", path: ["variants", i, "size"], message: "Duplicate size/colour combination." });
      combos.add(combo);
      if (v.color && !colorNames.has(v.color.toLowerCase())) ctx.addIssue({ code: "custom", path: ["variants", i, "color"], message: `Variant uses an unknown colour (${v.color}).` });
    });
    p.images.forEach((img, i) => {
      if (img.color && !colorNames.has(img.color.toLowerCase())) ctx.addIssue({ code: "custom", path: ["images", i, "color"], message: `Image uses an unknown colour (${img.color}).` });
    });
    if (p.status === "ACTIVE" && !p.variants.some((v) => v.isActive)) {
      ctx.addIssue({ code: "custom", path: ["variants"], message: "An active product needs at least one active size." });
    }
  });

export type ProductInput = z.infer<typeof productInput>;

export const adminProductQuery = z.object({
  q: z.string().trim().max(80).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  ...paging(),
});

export const stockInput = z.object({
  updates: z
    .array(z.object({ variantId: objectId, stock: z.number().int().min(0, "Stock must be 0 or more.").max(100000) }))
    .min(1)
    .max(1000),
});

export const slugQuery = z.object({ slug: z.string().max(140), excludeId: objectId.optional() });

export const categoryInput = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: slug.optional(),
  description: optionalText(600),
  image: optionalLink,
  kind: z.enum(["category", "collection"]).default("category"),
  sortOrder: z.number().int().min(-1000).max(10000).default(0),
  isVisible: z.boolean().default(true),
  showInNav: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
});

export type CategoryInput = z.infer<typeof categoryInput>;

const measurement = z.string().trim().max(30).default("");

export const sizeGuideInput = z.object({
  name: z.string().trim().min(2, "Give the size guide a name.").max(100),
  unit: z.enum(["cm", "in"]).default("cm"),
  notes: optionalText(1000),
  isDefault: z.boolean().default(false),
  rows: z
    .array(
      z.object({
        size: z.string().trim().min(1, "Each row needs a size.").max(30),
        age: z.string().trim().max(40).default(""),
        height: measurement,
        chest: measurement,
        waist: measurement,
        length: measurement,
      }),
    )
    .min(1, "Add at least one row.")
    .max(40),
});

export type SizeGuideInput = z.infer<typeof sizeGuideInput>;
