import type { Metadata } from "next";
import { Search } from "lucide-react";
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
      title={q ? `Results for *“${q}”*` : "Search our *collection*"}
      description={q ? undefined : "Look for a style, colour, fabric or size."}
      heroChildren={
        <form action="/search" method="get" role="search" className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-cocoa/10 bg-cream-50 p-1.5 pl-5 focus-within:border-cocoa/40">
          <Search className="h-4 w-4 shrink-0 text-cocoa-400" aria-hidden />
          <label htmlFor="search-page-q" className="sr-only">
            Search products
          </label>
          <input id="search-page-q" name="q" defaultValue={q} placeholder="Dresses, knitwear, newborn…" className="h-11 min-w-0 flex-1 bg-transparent text-[0.95rem] focus:outline-none" />
          <button type="submit" className="h-11 shrink-0 rounded-full bg-cocoa px-5 text-[0.88rem] font-semibold text-cream-50 hover:bg-sage-700">
            Search
          </button>
        </form>
      }
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
