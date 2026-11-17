"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertStaff } from "@/lib/auth";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { slugify } from "@/lib/utils";

function refresh() {
  revalidatePath("/", "layout");
}

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

  // uniqueness checks with friendly messages
  const slugOwner = await db.product.findUnique({ where: { slug: v.slug }, select: { id: true } });
  if (slugOwner && slugOwner.id !== v.id) return { ok: false, message: "Another product already uses this URL slug.", errors: { slug: ["Slug already in use."] } };
  if (v.variants.length) {
    const clash = await db.productVariant.findFirst({
      where: { sku: { in: v.variants.map((x) => x.sku) }, ...(v.id ? { productId: { not: v.id } } : {}) },
      select: { sku: true, product: { select: { name: true } } },
    });
    if (clash) return { ok: false, message: `SKU ${clash.sku} is already used by “${clash.product.name}”.` };
  }
  if (v.id) {
    const exists = await db.product.findUnique({ where: { id: v.id }, select: { id: true } });
    if (!exists) return { ok: false, message: "This product no longer exists." };
  }

  try {
    const product = await db.$transaction(async (tx) => {
      const data = {
        name: v.name,
        slug: v.slug,
        description: v.description,
        fabric: v.fabric ?? null,
        care: v.care ?? null,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        status: v.status,
        gender: v.gender,
        isFeatured: v.isFeatured,
        isNewArrival: v.isNewArrival,
        isBestSeller: v.isBestSeller,
        isSample: v.isSample,
        sizeGuideId: v.sizeGuideId || null,
        seoTitle: v.seoTitle ?? null,
        seoDescription: v.seoDescription ?? null,
      };
      const p = v.id
        ? await tx.product.update({ where: { id: v.id }, data: { ...data, categories: { set: v.categoryIds.map((id) => ({ id })) } } })
        : await tx.product.create({ data: { ...data, categories: { connect: v.categoryIds.map((id) => ({ id })) } } });

      // ---- colours
      const existingColors = await tx.productColor.findMany({ where: { productId: p.id }, select: { id: true } });
      const existingColorIds = new Set(existingColors.map((c) => c.id));
      const keptColorIds = v.colors.map((c) => c.id).filter((id): id is string => !!id && existingColorIds.has(id));
      await tx.productColor.deleteMany({ where: { productId: p.id, id: { notIn: keptColorIds } } });
      const colorIdByKey = new Map<string, string>();
      for (const [i, c] of v.colors.entries()) {
        if (c.id && existingColorIds.has(c.id)) {
          await tx.productColor.update({ where: { id: c.id }, data: { name: c.name, hex: c.hex.toUpperCase(), sortOrder: i } });
          colorIdByKey.set(c.key, c.id);
        } else {
          const created = await tx.productColor.create({ data: { productId: p.id, name: c.name, hex: c.hex.toUpperCase(), sortOrder: i } });
          colorIdByKey.set(c.key, created.id);
        }
      }
      const colorFor = (key: string | null) => (key ? colorIdByKey.get(key) ?? null : null);

      // ---- images
      const existingImages = await tx.productImage.findMany({ where: { productId: p.id }, select: { id: true } });
      const existingImageIds = new Set(existingImages.map((x) => x.id));
      const keptImageIds = v.images.map((x) => x.id).filter((id): id is string => !!id && existingImageIds.has(id));
      await tx.productImage.deleteMany({ where: { productId: p.id, id: { notIn: keptImageIds } } });
      for (const [i, img] of v.images.entries()) {
        const data = { url: img.url, alt: img.alt, sortOrder: i, colorId: colorFor(img.colorKey) };
        if (img.id && existingImageIds.has(img.id)) await tx.productImage.update({ where: { id: img.id }, data });
        else await tx.productImage.create({ data: { ...data, productId: p.id } });
      }

      // ---- variants (two-pass so SKUs can be swapped without unique clashes)
      const existingVariants = await tx.productVariant.findMany({ where: { productId: p.id }, select: { id: true, sku: true } });
      const existingVariantMap = new Map(existingVariants.map((x) => [x.id, x.sku]));
      const keptVariantIds = v.variants.map((x) => x.id).filter((id): id is string => !!id && existingVariantMap.has(id));
      await tx.productVariant.deleteMany({ where: { productId: p.id, id: { notIn: keptVariantIds } } });
      for (const variant of v.variants) {
        if (variant.id && existingVariantMap.has(variant.id) && existingVariantMap.get(variant.id) !== variant.sku) {
          await tx.productVariant.update({ where: { id: variant.id }, data: { sku: `tmp-${variant.id}` } });
        }
      }
      for (const variant of v.variants) {
        const data = {
          size: variant.size,
          sku: variant.sku,
          stock: variant.stock,
          price: variant.price,
          isActive: variant.isActive,
          colorId: colorFor(variant.colorKey),
        };
        if (variant.id && existingVariantMap.has(variant.id)) await tx.productVariant.update({ where: { id: variant.id }, data });
        else await tx.productVariant.create({ data: { ...data, productId: p.id } });
      }
      return p;
    });
    refresh();
    return { ok: true, message: v.id ? "Product saved." : "Product created.", data: { id: product.id, slug: product.slug } };
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
}

export async function checkSlugAction(slug: string, excludeId?: string) {
  await assertStaff();
  const s = slugify(slug);
  if (!s) return { available: false, slug: s };
  const owner = await db.product.findUnique({ where: { slug: s }, select: { id: true } });
  return { available: !owner || owner.id === excludeId, slug: s };
}

export async function deleteProductAction(formData: FormData) {
  await assertStaff();
  const id = z.string().min(1).max(40).parse(formData.get("id"));
  await db.product.delete({ where: { id } }).catch(() => null);
  refresh();
  redirect("/admin/products?deleted=1");
}

export async function deleteSampleProductsAction() {
  await assertStaff({ adminOnly: true });
  const res = await db.product.deleteMany({ where: { isSample: true } });
  refresh();
  redirect(`/admin/products?removedSamples=${res.count}`);
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
  const owner = await db.category.findUnique({ where: { slug }, select: { id: true } });
  if (owner && owner.id !== v.id) return { ok: false, message: "Another category already uses this slug.", errors: { slug: ["Slug already in use."] } };
  const data = {
    name: v.name,
    slug,
    description: v.description ?? null,
    image: v.image ?? null,
    kind: v.kind,
    sortOrder: v.sortOrder,
    isVisible: v.isVisible,
    showInNav: v.showInNav,
    isFeatured: v.isFeatured,
    seoTitle: v.seoTitle ?? null,
    seoDescription: v.seoDescription ?? null,
  };
  let id: string;
  try {
    const c = v.id ? await db.category.update({ where: { id: v.id }, data }) : await db.category.create({ data });
    id = c.id;
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
  refresh();
  if (!v.id) redirect(`/admin/categories/${id}?created=1`);
  return { ok: true, message: "Category saved.", data: { id } };
}

export async function deleteCategoryAction(formData: FormData) {
  await assertStaff();
  const id = z.string().min(1).max(40).parse(formData.get("id"));
  await db.category.delete({ where: { id } }).catch(() => null);
  refresh();
  redirect("/admin/categories?deleted=1");
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
  try {
    await db.$transaction(parsed.data.map((u) => db.productVariant.update({ where: { id: u.id }, data: { stock: u.stock } })));
    refresh();
    return { ok: true, message: `Updated stock for ${parsed.data.length} variant${parsed.data.length === 1 ? "" : "s"}.`, data: { count: parsed.data.length } };
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
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
  const v = parsed.data;
  try {
    const guide = await db.$transaction(async (tx) => {
      if (v.isDefault) await tx.sizeGuide.updateMany({ where: v.id ? { id: { not: v.id } } : {}, data: { isDefault: false } });
      const data = { name: v.name, unit: v.unit, notes: v.notes ?? null, isDefault: v.isDefault, rows: v.rows };
      return v.id ? tx.sizeGuide.update({ where: { id: v.id }, data }) : tx.sizeGuide.create({ data });
    });
    refresh();
    return { ok: true, message: v.id ? "Size guide saved." : "Size guide created.", data: { id: guide.id } };
  } catch (e) {
    return { ok: false, message: errMessage(e) };
  }
}

export async function deleteSizeGuideAction(formData: FormData) {
  await assertStaff();
  const id = z.string().min(1).max(40).parse(formData.get("id"));
  await db.sizeGuide.delete({ where: { id } }).catch(() => null);
  refresh();
  redirect("/admin/size-guides?deleted=1");
}
