import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CategoryGrid } from "@/components/home/category-grid";
import { PageBanner } from "@/components/layout/page-hero";
import { countProductsInCategory, VIRTUAL_COLLECTION_IMAGES, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { CATEGORIES } from "@/data/catalog";

const LABELS: Record<string, string> = { "new-arrivals": "Just in", "best-sellers": "Most loved", sale: "While sizes last" };

export const metadata: Metadata = { title: "Collections", description: "Browse every Kinder Thread category and collection.", alternates: { canonical: "/collections" } };

/** Every collection: a photo banner, the featured edits as photo banners, then every category as photo tiles. */
export default async function CollectionsIndex() {
  const cats = CATEGORIES.filter((c) => c.isVisible && c.image).sort((a, b) => a.kind.localeCompare(b.kind) || a.sortOrder - b.sortOrder);
  const virtual = Object.entries(VIRTUAL_COLLECTIONS);
  return (
    <>
      <PageBanner
        image="/images/editorial/nursery.webp"
        position="50% 60%"
        eyebrow="Explore"
        title="All *collections*"
        description="From very first days to busy little adventures — every category and edit in one place."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Collections" }]}
      />

      <section className="container-kt pt-10 md:pt-14" aria-label="Featured edits">
        <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
          {virtual.map(([slug, v]) => (
            <li key={slug}>
              <Link href={`/collections/${slug}`} className="group relative block aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-cream-200 md:aspect-[4/5]">
                {VIRTUAL_COLLECTION_IMAGES[slug] && <Image src={VIRTUAL_COLLECTION_IMAGES[slug]} alt="" fill sizes="(min-width: 768px) 32vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.04]" />}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-cocoa-900/80 via-cocoa-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream-50 md:p-7">
                  <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-cream-100/90 uppercase">{LABELS[slug] ?? "Collection"}</p>
                  <h2 className="mt-2 font-display text-[clamp(1.8rem,1.2rem+1.4vw,2.6rem)] leading-[1] font-medium tracking-[-0.04em]">{v.name}</h2>
                  <p className="mt-2 hidden max-w-xs text-[0.9rem] text-cream-100/85 md:block">{v.description}</p>
                  <span className="mt-5 inline-flex h-11 items-center rounded-full bg-cream-50 px-6 text-[0.76rem] font-semibold tracking-[0.14em] text-cocoa uppercase transition-colors group-hover:bg-sun-200">Shop now</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="pt-16 pb-4 md:pt-24">
        <CategoryGrid tiles={cats.map((c) => ({ name: `${c.name.replace(/ Collection$/, "")} · ${countProductsInCategory(c.id)}`, href: `/collections/${c.slug}`, image: c.image! }))} />
      </div>
    </>
  );
}
