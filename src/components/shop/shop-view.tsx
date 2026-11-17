import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ActiveFilters, FilterPanel, MobileFilters, PendingGrid, ShopProvider, SortSelect, type Facets } from "./filters";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[0.8rem] text-cocoa-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-cocoa hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-cocoa">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function pageHref(basePath: string, sp: Record<string, string | string[] | undefined>, page: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") p.set(k, Array.isArray(v) ? v.join(",") : v);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function ShopView({
  eyebrow,
  title,
  description,
  breadcrumb,
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
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumb: { label: string; href?: string }[];
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
}) {
  return (
    <ShopProvider>
      <div className="container-kt pt-8 pb-10 md:pt-12">
        <Breadcrumbs items={breadcrumb} />
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow && <p className="eyebrow eyebrow-rule">{eyebrow}</p>}
            <h1 className="display-lg mt-3">{title}</h1>
            {description && <p className="mt-3 text-[1.02rem] leading-relaxed text-cocoa-500">{description}</p>}
          </div>
          <p className="text-[0.85rem] text-cocoa-500" aria-live="polite">
            {total} {total === 1 ? "style" : "styles"}
          </p>
        </div>
      </div>

      <div className="container-kt grid gap-10 pb-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2" data-lenis-prevent>
            <Suspense>
              <FilterPanel facets={facets} hideGender={hideGender} />
            </Suspense>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-cocoa-100 pb-4">
            <Suspense>
              <MobileFilters facets={facets} total={total} hideGender={hideGender} />
              <div className="hidden lg:block">
                <ActiveFilters />
              </div>
              <div className="ml-auto">
                <SortSelect />
              </div>
            </Suspense>
          </div>
          <div className="mb-4 lg:hidden">
            <Suspense>
              <ActiveFilters />
            </Suspense>
          </div>
          <PendingGrid>
            {products.length ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 xl:grid-cols-3">
                {products.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={i < 3} showSample={showSample} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="stitch-border flex flex-col items-center rounded-sm px-6 py-20 text-center">
                <p className="font-display text-2xl">No styles match these filters</p>
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
                <Link href={pageHref(basePath, searchParams, page - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa-100 hover:border-cocoa" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={pageHref(basePath, searchParams, n)} aria-current={n === page ? "page" : undefined} className={cn("grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-bold", n === page ? "bg-cocoa text-cream-50" : "hover:bg-cocoa-50")}>
                  {n}
                </Link>
              ))}
              {page < pages && (
                <Link href={pageHref(basePath, searchParams, page + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa-100 hover:border-cocoa" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </ShopProvider>
  );
}
