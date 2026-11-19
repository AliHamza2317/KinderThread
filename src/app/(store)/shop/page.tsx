import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { getCollectionPills, getFacets, listProducts, parseFilters } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { buildSlides } from "@/lib/slides";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Shop baby and kids clothing for ages 0–5: rompers, dresses, sets, sleepsuits and everyday wear.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [res, facets, settings, pills] = await Promise.all([listProducts(filters), getFacets(), getSettings(), getCollectionPills()]);
  return (
    <ShopView
      eyebrow="The collection"
      title="Shop *all*"
      pills={pills}
      slider={buildSlides(settings.home.shopSlider)}
      description="Thoughtfully selected outfits for newborns, babies and little ones up to five years."
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      {...res}
      facets={facets}
      basePath="/shop"
      searchParams={sp}
      showSample={settings.features.showSampleBadges}
    />
  );
}
