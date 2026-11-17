import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getFacets, listProducts, parseFilters } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q;
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const q = filters.q ?? "";
  const [res, facets, settings] = await Promise.all([listProducts(filters), getFacets({ q }), getSettings()]);
  return (
    <ShopView
      eyebrow="Search"
      title={q ? `“${q}”` : "Search our collection"}
      description={q ? undefined : "Use the search icon at the top of the page to look for a style, colour or SKU."}
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Search" }]}
      {...res}
      facets={facets}
      basePath="/search"
      searchParams={sp}
      showSample={settings.features.showSampleBadges}
      emptyAction={{ href: "/shop", label: "Browse all products" }}
    />
  );
}
