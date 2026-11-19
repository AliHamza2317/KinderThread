import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSlider, SlideBanner, type Slide } from "@/components/home/hero-slider";
import { Breadcrumbs, PageHero, PillNav, type Crumb } from "@/components/layout/page-hero";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ActiveFilters, AgePills, FilterDrawer, PendingGrid, ShopProvider, SortSelect, type Facets } from "./filters";

export { Breadcrumbs } from "@/components/layout/page-hero";

function pageHref(basePath: string, sp: Record<string, string | string[] | undefined>, page: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") p.set(k, Array.isArray(v) ? v.join(",") : v);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Collection / shop listing in the style of brand stores: a title band (with the
 * collection photo when there is one), collection pills, a slim toolbar with the
 * product count, quick age filters and a "Filter & sort" drawer, then a full-width grid.
 */
export function ShopView({
  eyebrow,
  title,
  description,
  breadcrumb,
  image,
  pills,
  products,
  total,
  page,
  pages,
  facets,
  basePath,
  searchParams,
  hideGender,
  showSample,
  emptyAction,
  heroChildren,
  slider,
  banner,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumb: Crumb[];
  image?: string | null;
  pills?: { label: string; href: string; active?: boolean }[];
  products: ProductCardData[];
  total: number;
  page: number;
  pages: number;
  facets: Facets;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  hideGender?: boolean;
  showSample: boolean;
  emptyAction?: { href: string; label: string };
  heroChildren?: ReactNode;
  /** campaign slides shown at the top instead of the title band (shop page) */
  slider?: Slide[];
  /** a single campaign-style banner (collection pages) */
  banner?: Slide | null;
}) {
  return (
    <ShopProvider>
      {slider && slider.length > 0 ? (
        <>
          {/* the slider is the visual header here; the page title stays for screen readers and search */}
          <h1 className="sr-only">{title.replace(/\*/g, "")}</h1>
          <HeroSlider slides={slider} size="page" label="Shop highlights" />
        </>
      ) : banner ? (
        <SlideBanner slide={banner} top={<Breadcrumbs items={breadcrumb} className="mb-6 [&_*]:!text-current [&_*]:opacity-80" />} />
      ) : (
        <PageHero eyebrow={eyebrow} title={title} description={description} breadcrumb={breadcrumb} image={image} imageAlt="">
          {heroChildren}
        </PageHero>
      )}

      {pills && pills.length > 0 && <PillNav items={pills} label="Collections" className="mt-6" />}

      <div className="container-kt mt-8 md:mt-10">
        <div className="flex items-center gap-3 border-y border-cocoa/10 py-3">
          <p className="shrink-0 text-[0.85rem] text-cocoa-500" aria-live="polite">
            <span className="font-semibold text-cocoa">{total}</span> {total === 1 ? "style" : "styles"}
          </p>
          <div className="mx-auto hidden lg:block">
            <Suspense>
              <AgePills />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Suspense>
              <div className="hidden md:block">
                <SortSelect />
              </div>
              <FilterDrawer facets={facets} total={total} hideGender={hideGender} />
            </Suspense>
          </div>
        </div>
        <div className="mt-3 lg:hidden">
          <Suspense>
            <div className="scrollbar-none -mx-5 overflow-x-auto px-5 [&>div]:flex-nowrap">
              <AgePills />
            </div>
          </Suspense>
        </div>
        <div className="mt-4">
          <Suspense>
            <ActiveFilters />
          </Suspense>
        </div>
      </div>

      <div className="container-kt pt-6 pb-10">
        <PendingGrid>
          {products.length ? (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 2} showSample={showSample} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-[2rem] bg-cream-100 px-6 py-20 text-center">
              <p className="font-display text-2xl tracking-[-0.03em]">No styles match these filters</p>
              <p className="mt-2 max-w-sm text-cocoa-500">Try removing a filter or two — or browse everything we have.</p>
              <ButtonLink href={emptyAction?.href ?? basePath} variant="secondary" className="mt-6">
                {emptyAction?.label ?? "Clear filters"}
              </ButtonLink>
            </div>
          )}
        </PendingGrid>

        {pages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <Link href={pageHref(basePath, searchParams, page - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/12 hover:border-cocoa" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(basePath, searchParams, n)}
                aria-current={n === page ? "page" : undefined}
                className={cn("grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-semibold", n === page ? "bg-cocoa text-cream-50" : "hover:bg-cocoa/5")}
              >
                {n}
              </Link>
            ))}
            {page < pages && (
              <Link href={pageHref(basePath, searchParams, page + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa/12 hover:border-cocoa" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        )}
      </div>
    </ShopProvider>
  );
}
