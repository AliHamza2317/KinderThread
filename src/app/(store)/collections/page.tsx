import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { countProductsInCategory, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { CATEGORIES } from "@/data/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Collections", description: "Browse every Kinder Thread category and collection.", alternates: { canonical: "/collections" } };

const VIRTUAL_IMAGES: Record<string, string> = {
  "new-arrivals": "/images/gallery/g1.webp",
  "best-sellers": "/images/products/nordic-cardigan-rose.webp",
  sale: "/images/editorial/banner-knitwear.webp",
};

function Card({ href, name, image, meta, className, sizes }: { href: string; name: string; image: string | null; meta: string; className?: string; sizes: string }) {
  return (
    <Link href={href} className={cn("group relative block overflow-hidden rounded-[1.75rem] bg-cream-200 md:rounded-[2rem]", className)}>
      {image && <Image src={image} alt="" fill sizes={sizes} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.05]" />}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-cocoa-900/65 via-cocoa-900/5 to-transparent" />
      <span className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-cream-50 text-cocoa transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight className="h-4 w-4" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 text-cream-50 md:p-7">
        <p className="text-[0.75rem] font-medium text-cream-100/85">{meta}</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,1rem+1.6vw,2.4rem)] leading-[1] tracking-[-0.04em]">{name}</h2>
      </div>
    </Link>
  );
}

/** Every collection as large photo cards, the featured edits first. */
export default async function CollectionsIndex() {
  const cats = CATEGORIES.filter((c) => c.isVisible).sort((a, b) => a.kind.localeCompare(b.kind) || a.sortOrder - b.sortOrder);
  const virtual = Object.entries(VIRTUAL_COLLECTIONS);
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="All *collections*"
        description="From very first days to busy little adventures — every category and edit in one place."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Collections" }]}
      />
      <div className="container-kt py-12 md:py-16">
        <Reveal stagger={0.06} className="grid gap-3 md:grid-cols-3 md:gap-4">
          {virtual.map(([slug, v], i) => (
            <Card
              key={slug}
              href={`/collections/${slug}`}
              name={v.name}
              image={VIRTUAL_IMAGES[slug] ?? null}
              meta={v.description}
              className={cn("aspect-[4/3] md:aspect-[4/5]", i === 0 && "md:row-span-1")}
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          ))}
        </Reveal>

        <div className="mt-16 flex items-end justify-between gap-4 md:mt-24">
          <h2 className="display-md">
            Shop by <span className="font-serif-accent text-sage-700">category</span>
          </h2>
          <p className="text-[0.85rem] text-cocoa-500">{cats.length} categories</p>
        </div>
        <Reveal stagger={0.05} className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {cats.map((c) => {
            const n = countProductsInCategory(c.id);
            return (
              <Card key={c.id} href={`/collections/${c.slug}`} name={c.name} image={c.image} meta={`${n} ${n === 1 ? "piece" : "pieces"}`} className="aspect-[4/5]" sizes="(min-width: 1024px) 24vw, 50vw" />
            );
          })}
        </Reveal>
      </div>
    </>
  );
}
