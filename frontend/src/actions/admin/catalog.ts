"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { assertStaff } from "@/lib/auth";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/demo";
import { slugify } from "@/lib/utils";

/*
 * Frontend-only build: these actions validate input exactly as the real
 * backend will, then return a demo message instead of saving anything.
 */

function errMessage(e: unknown) {
  if (e instanceof Error) {
    if (e.message.includes("Unique constraint")) return "Something with that slug or SKU already exists.";
    return e.message;
  }
  return "Something went wrong. Please try again.";
}

/* ================================ PRODUCTS ================================ */

const optStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const productSchema = z
  .object({
    id: z.string().max(40).optional(),
    name: z.string().trim().min(2, "Product name is required.").max(140),
    slug: z
      .string()
      .trim()
      .max(90)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only."),
    description: z.string().trim().min(10, "Add a short description (10+ characters).").max(6000),
    fabric: optStr(300),
    care: optStr(800),
    price: z.number().int("Use whole rupees.").min(0).max(10_000_000),
    compareAtPrice: z.number().int().min(0).max(10_000_000).nullable(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    gender: z.enum(["BOY", "GIRL", "UNISEX"]),
    categoryIds: z.array(z.string().max(40)).max(30),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    isBestSeller: z.boolean(),
    isSample: z.boolean(),
    sizeGuideId: z.string().max(40).nullable(),
    seoTitle: optStr(160),
    seoDescription: optStr(320),
    colors: z
      .array(
        z.object({
          id: z.string().max(40).optional(),
          key: z.string().min(1).max(60),
          name: z.string().trim().min(1, "Every colour needs a name.").max(40),
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours must be a hex value like #8A9E72."),
        }),
      )
      .max(20),
    images: z
      .array(
        z.object({
          id: z.string().max(40).optional(),
          url: z.string().min(1).max(600),
          alt: z.string().trim().max(200),
          colorKey: z.string().max(60).nullable(),
        }),
      )
      .max(40),
    variants: z
      .array(
        z.object({
          id: z.string().max(40).optional(),
          size: z.string().trim().min(1).max(30),
          colorKey: z.string().max(60).nullable(),
          sku: z
            .string()
            .trim()
            .min(2, "Every variant needs a SKU.")
            .max(60)
            .regex(/^[A-Za-z0-9._-]+$/, "SKUs may only contain letters, numbers, dots, dashes and underscores."),
          stock: z.number().int().min(0, "Stock can't be negative.").max(100000),
          price: z.number().int().min(0).max(10_000_000).nullable(),
          isActive: z.boolean(),
        }),
      )
      .max(400),
  })
  .superRefine((v, ctx) => {
    if (v.compareAtPrice != null && v.compareAtPrice <= v.price)
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Compare-at price must be higher than the selling price." });
    const skus = new Set<string>();
    for (const [i, variant] of v.variants.entries()) {
      const k = variant.sku.toUpperCase();
      if (skus.has(k)) ctx.addIssue({ code: "custom", path: ["variants", i, "sku"], message: `SKU ${variant.sku} is used twice.` });
      skus.add(k);
    }
    const combos = new Set<string>();
    for (const [i, variant] of v.variants.entries()) {
      const k = `${variant.colorKey ?? "-"}|${variant.size}`;
      if (combos.has(k)) ctx.addIssue({ code: "custom", path: ["variants", i, "size"], message: "Duplicate size/colour combination." });
      combos.add(k);
    }
    const colorKeys = new Set(v.colors.map((c) => c.key));
    for (const [i, variant] of v.variants.entries()) {
      if (variant.colorKey && !colorKeys.has(variant.colorKey))
        ctx.addIssue({ code: "custom", path: ["variants", i, "colorKey"], message: "Variant refers to a removed colour." });
    }
    if (v.status === "ACTIVE" && !v.variants.some((x) => x.isActive))
      ctx.addIssue({ code: "custom", path: ["variants"], message: "An active product needs at least one active size/variant." });
  });

export type ProductInput = z.input<typeof productSchema>;

export async function saveProductAction(input: ProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await assertStaff();
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  }
  const v = parsed.data;

  // uniqueness checks against the dummy catalogue, with friendly messages
  const slugOwner = PRODUCTS.find((p) => p.slug === v.slug);
  if (slugOwner && slugOwner.id !== v.id) return { ok: false, message: "Another product already uses this URL slug.", errors: { slug: ["Slug already in use."] } };
  const wanted = new Set(v.variants.map((x) => x.sku.toUpperCase()));
  for (const p of PRODUCTS) {
    if (p.id === v.id) continue;
    const clash = p.variants.find((x) => wanted.has(x.sku.toUpperCase()));
    if (clash) return { ok: false, message: `SKU ${clash.sku} is already used by “${p.name}”.` };
  }
  if (v.id && !PRODUCTS.some((p) => p.id === v.id)) return { ok: false, message: "This product no longer exists." };
  return demoResult();
}

export async function checkSlugAction(slug: string, excludeId?: string) {
  await assertStaff();
  const s = slugify(slug);
  if (!s) return { available: false, slug: s };
  const owner = PRODUCTS.find((p) => p.slug === s);
  return { available: !owner || owner.id === excludeId, slug: s };
}

export async function deleteProductAction(formData: FormData) {
  await assertStaff();
  z.string().min(1).max(40).parse(formData.get("id"));
  redirect("/admin/products?demo=1");
}

export async function deleteSampleProductsAction() {
  await assertStaff({ adminOnly: true });
  redirect("/admin/products?demo=1");
}

/* =============================== CATEGORIES =============================== */

const categorySchema = z.object({
  id: z.string().max(40).optional(),
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: z.string().trim().max(80),
  description: optStr(600),
  image: optStr(600),
  kind: z.enum(["category", "collection"]),
  sortOrder: z.coerce.number().int().min(-1000).max(10000).default(0),
  isVisible: z.boolean(),
  showInNav: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: optStr(160),
  seoDescription: optStr(320),
});

const RESERVED_COLLECTION_SLUGS = new Set(["new-arrivals", "best-sellers", "sale"]);

export async function saveCategoryAction(_prev: ActionResult<{ id: string }>, formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    await assertStaff();
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
  const raw = Object.fromEntries(formData);
  const parsed = categorySchema.safeParse({
    ...raw,
    id: raw.id ? String(raw.id) : undefined,
    isVisible: formData.get("isVisible") === "on",
    showInNav: formData.get("showInNav") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  const v = parsed.data;
  const slug = slugify(v.slug || v.name);
  if (!slug) return { ok: false, message: "Please enter a valid slug.", errors: { slug: ["Slug is required."] } };
  if (RESERVED_COLLECTION_SLUGS.has(slug))
    return { ok: false, message: `“${slug}” is reserved for an automatic collection.`, errors: { slug: ["Reserved slug — choose another."] } };
  const owner = CATEGORIES.find((c) => c.slug === slug);
  if (owner && owner.id !== v.id) return { ok: false, message: "Another category already uses this slug.", errors: { slug: ["Slug already in use."] } };
  return demoResult<{ id: string }>();
}

export async function deleteCategoryAction(formData: FormData) {
  await assertStaff();
  z.string().min(1).max(40).parse(formData.get("id"));
  redirect("/admin/categories?demo=1");
}

/* ================================ INVENTORY =============================== */

const stockSchema = z.array(z.object({ id: z.string().min(1).max(40), stock: z.number().int().min(0).max(100000) })).min(1).max(1000);

export async function saveStockAction(updates: { id: string; stock: number }[]): Promise<ActionResult<{ count: number }>> {
  try {
    await assertStaff();
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
  const parsed = stockSchema.safeParse(updates);
  if (!parsed.success) return { ok: false, message: "Stock must be a whole number of 0 or more." };
  return demoResult<{ count: number }>();
}

/* =============================== SIZE GUIDES ============================== */

const sizeRow = z.object({
  size: z.string().trim().min(1, "Each row needs a size.").max(30),
  age: z.string().trim().max(40),
  height: z.string().trim().max(30),
  chest: z.string().trim().max(30),
  waist: z.string().trim().max(30),
  length: z.string().trim().max(30),
});

const sizeGuideSchema = z.object({
  id: z.string().max(40).optional(),
  name: z.string().trim().min(2, "Give the size guide a name.").max(100),
  unit: z.enum(["cm", "in"]),
  notes: optStr(1000),
  isDefault: z.boolean(),
  rows: z.array(sizeRow).min(1, "Add at least one row.").max(40),
});

export type SizeGuideInput = z.input<typeof sizeGuideSchema>;

export async function saveSizeGuideAction(input: SizeGuideInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertStaff();
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
  const parsed = sizeGuideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  return demoResult<{ id: string }>();
}

export async function deleteSizeGuideAction(formData: FormData) {
  await assertStaff();
  z.string().min(1).max(40).parse(formData.get("id"));
  redirect("/admin/size-guides?demo=1");
}
