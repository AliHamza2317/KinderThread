import type { QueryFilter, SortOrder } from "mongoose";
import { conflict, notFound } from "../../lib/http-error.js";
import { skipFor, toPage, type Page } from "../../lib/pagination.js";
import { AGE_GROUPS, sortSizes } from "../../lib/sizes.js";
import { containsText, escapeRegex, slugify } from "../../lib/text.js";
import { Category, type CategoryDocument } from "./category.model.js";
import { VIRTUAL_COLLECTIONS, isVirtualCollection } from "./collections.js";
import type { z } from "zod";
import type { adminProductQuery, ProductInput, ProductListQuery } from "./catalog.validation.js";
import { Product, type ProductDocument } from "./product.model.js";
import { SizeGuide } from "./size-guide.model.js";

type ProductFilter = QueryFilter<ProductDocument>;

/* ------------------------------------------------------------------------- */
/*                         product card (lists & grids)                      */
/* ------------------------------------------------------------------------- */

/** The small version of a product used by the shop grid, search and wishlists. */
export function toProductCard(product: ProductDocument) {
  const variants = product.variants
    .filter((v) => v.isActive)
    .map((v) => ({ id: v._id.toString(), sku: v.sku, size: v.size, color: v.color ?? null, stock: v.stock, price: v.price ?? product.price }));
  const availableSizes = sortSizes(variants.filter((v) => v.stock > 0).map((v) => v.size));

  return {
    id: product.id as string,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    isSample: product.isSample,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    images: product.images.slice(0, 2).map((i) => ({ url: i.url, alt: i.alt })),
    colors: product.colors.map((c) => ({ name: c.name, hex: c.hex })),
    sizes: sortSizes(variants.map((v) => v.size)),
    availableSizes,
    inStock: availableSizes.length > 0,
    variants,
  };
}

export type ProductCard = ReturnType<typeof toProductCard>;

/* ------------------------------------------------------------------------- */
/*                            storefront queries                             */
/* ------------------------------------------------------------------------- */

const SORTS: Record<ProductListQuery["sort"], Record<string, SortOrder>> = {
  featured: { isFeatured: -1, sortOrder: 1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
  best: { isBestSeller: -1, soldCount: -1, createdAt: -1 },
};

/**
 * Turns shop filters into a MongoDB query. Returns null when the category doesn't
 * exist, so the caller can answer with an empty list or a 404.
 */
async function buildFilter(query: Omit<ProductListQuery, "sort" | "page" | "limit">): Promise<ProductFilter | null> {
  const filter: ProductFilter = { status: "ACTIVE" };
  const and: ProductFilter[] = [];

  if (query.category) {
    if (isVirtualCollection(query.category)) {
      and.push(VIRTUAL_COLLECTIONS[query.category].filter);
    } else {
      const category = await Category.findOne({ slug: query.category, isVisible: true }).select("_id");
      if (!category) return null;
      filter.categories = category._id;
    }
  }

  if (query.q) {
    const text = containsText(query.q);
    const matchingCategories = await Category.find({ name: text, isVisible: true }).select("_id");
    and.push({
      $or: [{ name: text }, { description: text }, { "variants.sku": text }, { "colors.name": text }, { categories: { $in: matchingCategories.map((c) => c._id) } }],
    });
  }

  if (query.gender.length) filter.gender = { $in: query.gender };
  if (query.color.length) filter["colors.name"] = { $in: query.color.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i")) };
  if (query.sale) filter.compareAtPrice = { $ne: null };
  if (query.min != null || query.max != null) {
    filter.price = { ...(query.min != null && { $gte: query.min }), ...(query.max != null && { $lte: query.max }) };
  }

  // sizes picked directly plus the sizes of any chosen age group (?age=baby)
  const sizes = new Set(query.size);
  for (const age of query.age) AGE_GROUPS[age]?.forEach((s) => sizes.add(s));
  if (sizes.size || query.inStock) {
    and.push({
      variants: {
        $elemMatch: { isActive: true, ...(sizes.size && { size: { $in: [...sizes] } }), ...(query.inStock && { stock: { $gt: 0 } }) },
      },
    });
  }

  if (and.length) filter.$and = and;
  return filter;
}

export async function listProducts(query: ProductListQuery): Promise<Page<ProductCard>> {
  const filter = await buildFilter(query);
  if (!filter) return toPage([], 0, query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[query.sort])
      .skip(skipFor(query))
      .limit(query.limit),
    Product.countDocuments(filter),
  ]);
  return toPage(products.map(toProductCard), total, query);
}

/** Filter options (colours, sizes, price range …) available within a shop page. */
export async function getFacets(query: ProductListQuery) {
  const filter = await buildFilter({ ...query, gender: [], size: [], age: [], color: [], min: undefined, max: undefined, inStock: false, sale: false });
  const products = filter ? await Product.find(filter).select("gender price colors variants") : [];

  const colors = new Map<string, string>();
  const sizes = new Set<string>();
  const genders = new Set<string>();
  for (const p of products) {
    p.colors.forEach((c) => colors.set(c.name, c.hex));
    p.variants.filter((v) => v.isActive).forEach((v) => sizes.add(v.size));
    genders.add(p.gender);
  }
  const prices = products.map((p) => p.price);

  return {
    colors: [...colors].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
    sizes: sortSizes(sizes),
    genders: [...genders],
    price: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  };
}

/** Full product page data: active sizes only, its size guide and a few related products. */
export async function getProductBySlug(slug: string) {
  const product = await Product.findOne({ slug, status: "ACTIVE" }).populate<{ categories: CategoryDocument[] }>("categories", "name slug");
  if (!product) throw notFound("Product not found.");

  const [sizeGuide, related] = await Promise.all([
    product.sizeGuide ? SizeGuide.findById(product.sizeGuide) : SizeGuide.findOne({ isDefault: true }),
    Product.find({ _id: { $ne: product._id }, status: "ACTIVE", categories: { $in: product.categories.map((c) => c._id) } })
      .sort(SORTS.featured)
      .limit(4),
  ]);

  const json = product.toJSON();
  return {
    ...json,
    variants: json.variants.filter((v: { isActive: boolean }) => v.isActive),
    sizeGuide: sizeGuide ?? null,
    related: related.map(toProductCard),
  };
}

/** Cards for a list of ids (wishlist, recently viewed), in the order asked for. */
export async function getProductsByIds(ids: string[]): Promise<ProductCard[]> {
  const products = await Product.find({ _id: { $in: ids }, status: "ACTIVE" });
  const byId = new Map(products.map((p) => [p.id as string, p]));
  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [toProductCard(product)] : [];
  });
}

/* ------------------------------------------------------------------------- */
/*                                   admin                                   */
/* ------------------------------------------------------------------------- */

export async function listAdminProducts(query: z.infer<typeof adminProductQuery>) {
  const filter: ProductFilter = {};
  if (query.status) filter.status = query.status;
  if (query.q) {
    const text = containsText(query.q);
    filter.$or = [{ name: text }, { slug: text }, { "variants.sku": text }];
  }
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skipFor(query))
      .limit(query.limit),
    Product.countDocuments(filter),
  ]);
  const items = products.map((p) => ({
    id: p.id as string,
    name: p.name,
    slug: p.slug,
    status: p.status,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    image: p.images[0]?.url ?? null,
    isSample: p.isSample,
    variantCount: p.variants.length,
    totalStock: p.variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0),
    updatedAt: p.updatedAt,
  }));
  return toPage(items, total, query);
}

export async function getProductById(id: string) {
  const product = await Product.findById(id);
  if (!product) throw notFound("Product not found.");
  return product;
}

/** Friendly checks before saving (the unique indexes are the final safety net). */
async function assertUnique(input: ProductInput & { slug: string }, excludeId?: string) {
  const others = excludeId ? { _id: { $ne: excludeId } } : {};
  if (await Product.exists({ ...others, slug: input.slug })) {
    throw conflict("Another product already uses this URL slug.", { slug: ["Slug already in use."] });
  }
  const skus = input.variants.map((v) => new RegExp(`^${escapeRegex(v.sku)}$`, "i"));
  if (skus.length) {
    const clash = await Product.findOne({ ...others, "variants.sku": { $in: skus } }).select("name variants.sku");
    if (clash) throw conflict(`One of these SKUs is already used by “${clash.name}”.`, { variants: ["SKU already in use."] });
  }
}

/** Maps validated input onto the document fields (variant ids are kept so carts stay valid). */
function productFields(input: ProductInput & { slug: string }) {
  return {
    ...input,
    variants: input.variants.map(({ id, ...variant }) => ({ ...(id && { _id: id }), ...variant })),
  };
}

export async function createProduct(input: ProductInput) {
  const data = { ...input, slug: input.slug || slugify(input.name) };
  await assertUnique(data);
  return Product.create(productFields(data));
}

export async function updateProduct(id: string, input: ProductInput) {
  const product = await getProductById(id);
  const data = { ...input, slug: input.slug || slugify(input.name) };
  await assertUnique(data, id);
  product.set(productFields(data));
  return product.save();
}

export async function deleteProduct(id: string) {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw notFound("Product not found.");
}

/** Removes the placeholder products that came with the starter data. */
export async function deleteSampleProducts() {
  const { deletedCount } = await Product.deleteMany({ isSample: true });
  return { deleted: deletedCount };
}

export async function checkSlug(raw: string, excludeId?: string) {
  const slug = slugify(raw);
  if (!slug) return { slug, available: false };
  const owner = await Product.findOne({ slug }).select("_id");
  return { slug, available: !owner || owner.id === excludeId };
}

/** Sets stock for many variants at once (inventory screen). */
export async function updateStock(updates: { variantId: string; stock: number }[]) {
  const result = await Product.bulkWrite(
    updates.map((u) => ({
      updateOne: { filter: { "variants._id": u.variantId }, update: { $set: { "variants.$.stock": u.stock } } },
    })),
  );
  return { updated: result.matchedCount };
}

