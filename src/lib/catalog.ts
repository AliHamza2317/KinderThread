/**
 * Catalogue queries over the dummy data in src/data. The function signatures
 * match what a database-backed version will expose, so when the MongoDB
 * backend arrives only this file needs to change.
 */
import { cache } from "react";
import { ORDERS } from "@/data/admin";
import { CATEGORIES, PRODUCTS, SIZE_GUIDES } from "@/data/catalog";
import { AGE_GROUPS, sortSizes } from "@/lib/sizes";
import type { Category, Gender, Product } from "@/lib/types";

export const PAGE_SIZE = 24;

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  isSample: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: { url: string; alt: string }[];
  colors: { id: string; name: string; hex: string }[];
  sizes: string[];
  availableSizes: string[];
  inStock: boolean;
  variants: { id: string; size: string; colorId: string | null; stock: number; price: number; sku: string }[];
};

const sortBy = <T,>(arr: T[], ...keys: ((x: T) => number | string)[]) =>
  [...arr].sort((a, b) => {
    for (const k of keys) {
      const x = k(a);
      const y = k(b);
      if (x < y) return -1;
      if (x > y) return 1;
    }
    return 0;
  });

export function toCard(p: Product): ProductCardData {
  const variants = p.variants.filter((v) => v.isActive).map((v) => ({ id: v.id, size: v.size, colorId: v.colorId, stock: v.stock, sku: v.sku, price: v.price ?? p.price }));
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))]);
  const availableSizes = sortSizes([...new Set(variants.filter((v) => v.stock > 0).map((v) => v.size))]);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    isSample: p.isSample,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    images: sortBy(p.images, (i) => i.sortOrder).slice(0, 2).map((i) => ({ url: i.url, alt: i.alt })),
    colors: sortBy(p.colors, (c) => c.sortOrder).map((c) => ({ id: c.id, name: c.name, hex: c.hex })),
    sizes,
    availableSizes,
    inStock: availableSizes.length > 0,
    variants,
  };
}

export type CollectionFlag = "isNewArrival" | "isBestSeller" | "sale";

/** Automatic collections driven by product flags rather than category membership */
export const VIRTUAL_COLLECTIONS: Record<string, { name: string; description: string; flag: CollectionFlag }> = {
  "new-arrivals": { name: "New Arrivals", description: "Fresh pieces for the new season — soft colours, easy fits.", flag: "isNewArrival" },
  "best-sellers": { name: "Best Sellers", description: "The styles little ones (and their grown-ups) love most.", flag: "isBestSeller" },
  sale: { name: "On Sale", description: "Little treasures at little prices, while sizes last.", flag: "sale" },
};

export type ShopFilters = {
  category?: string;
  flag?: CollectionFlag;
  q?: string;
  gender?: string[];
  sizes?: string[];
  ages?: string[];
  colors?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
};

export function parseFilters(sp: Record<string, string | string[] | undefined>): ShopFilters {
  const list = (k: string) => {
    const v = sp[k];
    if (!v) return undefined;
    const arr = (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  };
  const num = (k: string) => {
    const v = Number(Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  const str = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) || undefined;
  return {
    q: str("q")?.slice(0, 80),
    gender: list("gender"),
    sizes: list("size"),
    ages: list("age"),
    colors: list("color"),
    min: num("min"),
    max: num("max"),
    inStock: str("stock") === "1",
    onSale: str("sale") === "1",
    sort: str("sort"),
    page: num("page") ?? 1,
  };
}

const categorySlug = new Map(CATEGORIES.map((c) => [c.id, c]));
const productCategories = (p: Product) => p.categoryIds.map((id) => categorySlug.get(id)).filter((c): c is Category => !!c);

function matches(p: Product, f: ShopFilters) {
  if (p.status !== "ACTIVE") return false;
  if (f.category && !productCategories(p).some((c) => c.slug === f.category)) return false;
  if (f.flag === "sale" && p.compareAtPrice == null) return false;
  if (f.flag && f.flag !== "sale" && !p[f.flag]) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [p.name, p.description, ...p.variants.map((v) => v.sku), ...productCategories(p).map((c) => c.name), ...p.colors.map((c) => c.name)].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.gender?.length) {
    const g = f.gender.map((x) => x.toUpperCase()) as Gender[];
    if (!g.includes(p.gender)) return false;
  }
  const sizeSet = new Set<string>(f.sizes ?? []);
  for (const age of f.ages ?? []) AGE_GROUPS.find((a) => a.id === age)?.sizes.forEach((s) => sizeSet.add(s));
  if (sizeSet.size && !p.variants.some((v) => v.isActive && sizeSet.has(v.size))) return false;
  if (f.colors?.length) {
    const wanted = f.colors.map((c) => c.toLowerCase());
    if (!p.colors.some((c) => wanted.includes(c.name.toLowerCase()))) return false;
  }
  if (f.min && p.price < f.min) return false;
  if (f.max && p.price > f.max) return false;
  if (f.inStock && !p.variants.some((v) => v.isActive && v.stock > 0)) return false;
  if (f.onSale && p.compareAtPrice == null) return false;
  return true;
}

const unitsSold = (id: string) => ORDERS.flatMap((o) => o.items).filter((i) => i.productId === id).reduce((n, i) => n + i.quantity, 0);

function sortProducts(list: Product[], sort?: string) {
  switch (sort) {
    case "newest":
      return sortBy(list, (p) => -p.createdAt.getTime());
    case "price-asc":
      return sortBy(list, (p) => p.price);
    case "price-desc":
      return sortBy(list, (p) => -p.price);
    case "best":
      return sortBy(list, (p) => (p.isBestSeller ? 0 : 1), (p) => -unitsSold(p.id), (p) => -p.createdAt.getTime());
    default:
      return sortBy(list, (p) => (p.isFeatured ? 0 : 1), (p) => p.sortOrder);
  }
}

export async function listProducts(f: ShopFilters) {
  const all = sortProducts(PRODUCTS.filter((p) => matches(p, f)), f.sort);
  const page = Math.max(1, f.page ?? 1);
  return {
    products: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toCard),
    total: all.length,
    page,
    pages: Math.max(1, Math.ceil(all.length / PAGE_SIZE)),
  };
}

/** Facet values available within a scope (category, flag collection or search). */
export async function getFacets(scope: { category?: string; flag?: CollectionFlag; q?: string } = {}) {
  const rows = PRODUCTS.filter((p) => matches(p, scope));
  const colorMap = new Map<string, string>();
  const sizes = new Set<string>();
  const genders = new Set<string>();
  let min = Infinity;
  let max = 0;
  for (const r of rows) {
    r.colors.forEach((c) => colorMap.set(c.name, c.hex));
    r.variants.filter((v) => v.isActive).forEach((v) => sizes.add(v.size));
    genders.add(r.gender);
    min = Math.min(min, r.price);
    max = Math.max(max, r.price);
  }
  return {
    colors: [...colorMap].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
    sizes: sortSizes([...sizes]),
    genders: [...genders],
    priceRange: rows.length ? { min, max } : { min: 0, max: 0 },
  };
}

export async function getProductsBy(flag: "isNewArrival" | "isBestSeller" | "isFeatured", take = 8) {
  return sortBy(PRODUCTS.filter((p) => p.status === "ACTIVE" && p[flag]), (p) => p.sortOrder).slice(0, take).map(toCard);
}

export async function getProductsByIds(ids: string[]) {
  const byId = new Map(PRODUCTS.filter((p) => p.status === "ACTIVE").map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p).map(toCard);
}

/** Synchronous version for client components (cart, wishlist, quick views). */
export function getProductsByIdsSync(ids: string[]) {
  const byId = new Map(PRODUCTS.filter((p) => p.status === "ACTIVE").map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p).map(toCard);
}

export const getProductBySlug = cache(async (slug: string) => {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p || p.status !== "ACTIVE") return null;
  const sizeGuide = SIZE_GUIDES.find((g) => g.id === p.sizeGuideId) ?? SIZE_GUIDES.find((g) => g.isDefault) ?? null;
  return {
    ...p,
    images: sortBy(p.images, (i) => i.sortOrder),
    colors: sortBy(p.colors, (c) => c.sortOrder),
    variants: p.variants.filter((v) => v.isActive),
    categories: productCategories(p).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    sizeGuide,
  };
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(productId: string, categoryIds: string[], take = 4) {
  const rows = PRODUCTS.filter((p) => p.status === "ACTIVE" && p.id !== productId && p.categoryIds.some((id) => categoryIds.includes(id)));
  return sortBy(rows, (p) => (p.isBestSeller ? 0 : 1), (p) => -p.createdAt.getTime()).slice(0, take).map(toCard);
}

export const getNavCategories = cache(async () =>
  sortBy(CATEGORIES.filter((c) => c.isVisible), (c) => c.sortOrder, (c) => c.name).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    kind: c.kind,
    showInNav: c.showInNav,
    isFeatured: c.isFeatured,
    image: c.image,
    description: c.description,
  })),
);

export const getCategoryBySlug = cache(async (slug: string) => CATEGORIES.find((c) => c.slug === slug && c.isVisible) ?? null);

/** Number of active products in a category. */
export function countProductsInCategory(categoryId: string) {
  return PRODUCTS.filter((p) => p.status === "ACTIVE" && p.categoryIds.includes(categoryId)).length;
}

/** Pills shown under shop/collection headers: all, new, every visible category/collection, best sellers, sale. */
export async function getCollectionPills(active?: string) {
  const cats = await getNavCategories();
  const items = [
    { label: "All", href: "/shop", slug: "__all" },
    { label: "New In", href: "/collections/new-arrivals", slug: "new-arrivals" },
    ...cats.map((c) => ({ label: c.name, href: `/collections/${c.slug}`, slug: c.slug })),
    { label: "Best Sellers", href: "/collections/best-sellers", slug: "best-sellers" },
    { label: "Sale", href: "/collections/sale", slug: "sale" },
  ];
  return items.map(({ slug, ...it }) => ({ ...it, active: slug === (active ?? "__all") }));
}
