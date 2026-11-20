import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { getCategoryBySlug, getCollectionPills, getFacets, listProducts, parseFilters, VIRTUAL_COLLECTION_IMAGES, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { accentLast } from "@/lib/utils";


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
  const [res, all, facets, settings, pills] = await Promise.all([
    listProducts(filters),
    listProducts({ ...parseFilters({}), category: c.category, flag: c.flag }),
    getFacets({ category: c.category, flag: c.flag }),
    getSettings(),
    getCollectionPills(slug),
  ]);
  // a few product photos from the whole collection (not the filtered view) for the header
  const thumbs = all.products
    .filter((p) => p.images[0])
    .slice(0, 3)
    .map((p) => ({ href: `/products/${p.slug}`, image: p.images[0].url, alt: p.name }));
  return (
    <ShopView
      eyebrow={c.kind === "collection" ? "Collection" : "Category"}
      title={accentLast(c.name)}
      description={c.description}
      image={c.image}
      pills={pills}
      collection={{ thumbs }}
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
