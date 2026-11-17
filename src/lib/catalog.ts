import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { AGE_GROUPS, sortSizes } from "@/lib/sizes";

export const PAGE_SIZE = 24;

const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2, select: { url: true, alt: true } },
  colors: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, hex: true } },
  variants: {
    where: { isActive: true },
    select: { id: true, size: true, colorId: true, stock: true, price: true, sku: true },
  },
} satisfies Prisma.ProductInclude;

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

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

export function toCard(p: CardRow): ProductCardData {
  const variants = p.variants.map((v) => ({ ...v, price: v.price ?? p.price }));
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
    images: p.images,
    colors: p.colors,
    sizes,
    availableSizes,
    inStock: availableSizes.length > 0,
    variants,
  };
}

export type ShopFilters = {
  category?: string;
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

function buildWhere(f: ShopFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: "ACTIVE" }];
  if (f.category) and.push({ categories: { some: { slug: f.category } } });
  if (f.q) {
    const q = f.q;
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
        { categories: { some: { name: { contains: q, mode: "insensitive" } } } },
        { colors: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    });
  }
  if (f.gender?.length) {
    const g = f.gender.map((x) => x.toUpperCase()).filter((x): x is "BOY" | "GIRL" | "UNISEX" => ["BOY", "GIRL", "UNISEX"].includes(x));
    if (g.length) and.push({ gender: { in: g } });
  }
  const sizeSet = new Set<string>(f.sizes ?? []);
  for (const age of f.ages ?? []) AGE_GROUPS.find((a) => a.id === age)?.sizes.forEach((s) => sizeSet.add(s));
  if (sizeSet.size) and.push({ variants: { some: { isActive: true, size: { in: [...sizeSet] } } } });
  if (f.colors?.length) and.push({ colors: { some: { name: { in: f.colors, mode: "insensitive" } } } });
  if (f.min) and.push({ price: { gte: f.min } });
  if (f.max) and.push({ price: { lte: f.max } });
  if (f.inStock) and.push({ variants: { some: { isActive: true, stock: { gt: 0 } } } });
  if (f.onSale) and.push({ compareAtPrice: { not: null } });
  return { AND: and };
}

function buildOrder(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "best":
      return [{ isBestSeller: "desc" }, { orderItems: { _count: "desc" } }, { createdAt: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }];
  }
}

export async function listProducts(f: ShopFilters) {
  const where = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);
  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      include: cardInclude,
      orderBy: buildOrder(f.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);
  return { products: rows.map(toCard), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Facet values available within a scope (category or whole shop). */
export async function getFacets(category?: string) {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", ...(category ? { categories: { some: { slug: category } } } : {}) },
    select: {
      price: true,
      gender: true,
      colors: { select: { name: true, hex: true } },
      variants: { where: { isActive: true }, select: { size: true } },
    },
  });
  const colorMap = new Map<string, string>();
  const sizes = new Set<string>();
  const genders = new Set<string>();
  let min = Infinity;
  let max = 0;
  for (const r of rows) {
    r.colors.forEach((c) => colorMap.set(c.name, c.hex));
    r.variants.forEach((v) => sizes.add(v.size));
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
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", [flag]: true },
    include: cardInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take,
  });
  return rows.map(toCard);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const rows = await db.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: cardInclude });
  const byId = new Map(rows.map((r) => [r.id, toCard(r)]));
  return ids.map((id) => byId.get(id)).filter((x): x is ProductCardData => !!x);
}

export const getProductBySlug = cache(async (slug: string) => {
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
      categories: { select: { id: true, name: true, slug: true } },
      sizeGuide: true,
    },
  });
  if (!p || p.status !== "ACTIVE") return null;
  const sizeGuide = p.sizeGuide ?? (await db.sizeGuide.findFirst({ where: { isDefault: true } }));
  return { ...p, sizeGuide };
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(productId: string, categoryIds: string[], take = 4) {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", id: { not: productId }, categories: { some: { id: { in: categoryIds } } } },
    include: cardInclude,
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    take,
  });
  return rows.map(toCard);
}

export const getNavCategories = cache(async () =>
  db.category.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, kind: true, showInNav: true, isFeatured: true, image: true, description: true },
  }),
);

export const getCategoryBySlug = cache(async (slug: string) =>
  db.category.findFirst({ where: { slug, isVisible: true } }),
);
