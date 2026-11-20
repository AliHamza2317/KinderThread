import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { getCategoryBySlug, getCollectionPills, getFacets, listProducts, parseFilters, VIRTUAL_COLLECTION_IMAGES, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { accentLast } from "@/lib/utils";

// which part of each collection photo stays in view in the wide banner
const BANNER_FOCUS: Record<string, string> = { "baby-boys": "50% 35%", "baby-girls": "50% 30%", newborn: "50% 55%", "everyday-wear": "50% 45%", "casual-outfits": "50% 40%", "matching-sets": "50% 45%", seasonal: "50% 50%", "new-arrivals": "50% 62%", "best-sellers": "50% 45%", sale: "50% 45%" };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function resolve(slug: string) {
  const v = VIRTUAL_COLLECTIONS[slug];
  if (v) return { name: v.name, description: v.description, seoTitle: null, seoDescription: null, flag: v.flag, category: undefined, kind: "collection", image: VIRTUAL_COLLECTION_IMAGES[slug] ?? null };
  const c = await getCategoryBySlug(slug);
  if (!c) return null;
  return { name: c.name, description: c.description, seoTitle: c.seoTitle, seoDescription: c.seoDescription, flag: undefined, category: c.slug, kind: c.kind, image: c.image };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await resolve(slug);
  if (!c) return {};
  return {
    title: c.seoTitle || c.name,
    description: c.seoDescription || c.description || `Shop ${c.name} at Kinder Thread — clothing for ages 0–5.`,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const c = await resolve(slug);
  if (!c) notFound();
  const filters = { ...parseFilters(sp), category: c.category, flag: c.flag };
  const [res, facets, settings, pills] = await Promise.all([listProducts(filters), getFacets({ category: c.category, flag: c.flag }), getSettings(), getCollectionPills(slug)]);
  return (
    <ShopView
      eyebrow={c.kind === "collection" ? "Collection" : "Category"}
      title={accentLast(c.name)}
      description={c.description}
      image={c.image}
      pills={pills}
      banner={c.image ? { image: c.image, position: BANNER_FOCUS[slug] } : null}
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: c.name }]}
      {...res}
      facets={facets}
      basePath={`/collections/${slug}`}
      searchParams={sp}
      hideGender={slug === "baby-boys" || slug === "baby-girls"}
      showSample={settings.features.showSampleBadges}
      emptyAction={res.total === 0 && Object.keys(sp).length === 0 ? { href: "/shop", label: "Browse all products" } : undefined}
    />
  );
}
