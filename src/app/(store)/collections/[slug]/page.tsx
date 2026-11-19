import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { getCategoryBySlug, getCollectionPills, getFacets, listProducts, parseFilters, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { accentLast } from "@/lib/utils";
import type { SlideTone } from "@/components/home/hero-slider";

// each collection banner gets its own colour field
const TONE_BY_SLUG: Record<string, SlideTone> = { "new-arrivals": "sun", "best-sellers": "coral", sale: "cocoa", "baby-boys": "sage", "baby-girls": "coral", newborn: "cream", "everyday-wear": "sun", "casual-outfits": "forest", "matching-sets": "sage", seasonal: "cocoa" };

// photographs for the collection headers of the virtual collections
const VIRTUAL_IMAGES: Record<string, string> = {
  "new-arrivals": "/images/gallery/g1.webp",
  "best-sellers": "/images/products/nordic-cardigan-rose.webp",
  sale: "/images/editorial/banner-knitwear.webp",
};
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function resolve(slug: string) {
  const v = VIRTUAL_COLLECTIONS[slug];
  if (v) return { name: v.name, description: v.description, seoTitle: null, seoDescription: null, flag: v.flag, category: undefined, kind: "collection", image: VIRTUAL_IMAGES[slug] ?? null };
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
      banner={
        c.image
          ? { eyebrow: c.kind === "collection" ? "Collection" : "Category", title: accentLast(c.name), body: c.description ?? "", ctaLabel: "", ctaHref: "", image: c.image, imageAlt: "", tone: TONE_BY_SLUG[slug] ?? "sage" }
          : null
      }
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
