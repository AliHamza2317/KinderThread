import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/shop-view";
import { Reveal } from "@/components/ui/reveal";
import { countProductsInCategory, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { CATEGORIES } from "@/data/catalog";

export const metadata: Metadata = { title: "Collections", description: "Browse every Kinder Thread category and collection.", alternates: { canonical: "/collections" } };

const TONES = ["bg-sage-100", "bg-coral-100", "bg-sun-100", "bg-bear-100", "bg-teal-100", "bg-cream-200"];

export default async function CollectionsIndex() {
  const cats = CATEGORIES.filter((c) => c.isVisible)
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, _count: { products: countProductsInCategory(c.id) } }));
  const virtual = Object.entries(VIRTUAL_COLLECTIONS);
  return (
    <div className="container-kt pt-8 pb-16 md:pt-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />
      <p className="eyebrow eyebrow-rule mt-6">Explore</p>
      <h1 className="display-lg mt-3">Collections</h1>

      <ul className="mt-8 flex flex-wrap gap-2">
        {virtual.map(([slug, v]) => (
          <li key={slug}>
            <Link href={`/collections/${slug}`} className="inline-block rounded-full border border-cocoa-200 px-5 py-2.5 text-[0.85rem] font-semibold transition hover:border-cocoa hover:bg-cocoa hover:text-cream-50">
              {v.name}
            </Link>
          </li>
        ))}
      </ul>

      <Reveal stagger={0.05} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {cats.map((c, i) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
            <div className={`relative aspect-[4/5] overflow-hidden rounded-[1.5rem] ${TONES[i % TONES.length]}`}>
              {c.image && <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 24vw, 46vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2 px-1">
              <h2 className="font-display text-xl">{c.name}</h2>
              <span className="text-[0.78rem] font-semibold text-cocoa-400">{c._count.products}</span>
            </div>
          </Link>
        ))}
      </Reveal>
    </div>
  );
}
