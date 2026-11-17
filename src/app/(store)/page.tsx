import { Banners } from "@/components/home/banners";
import { Benefits } from "@/components/home/benefits";
import { BrandStory } from "@/components/home/brand-story";
import { FeaturedCategories } from "@/components/home/categories";
import { Gallery } from "@/components/home/gallery";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { NewsletterSection } from "@/components/home/newsletter";
import { ProductRail, RailControls } from "@/components/home/product-rail";
import { SectionHeader } from "@/components/home/section-header";
import { Wardrobe, type WardrobeCategory } from "@/components/home/wardrobe";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import { getProductsBy } from "@/lib/catalog";
import { db } from "@/lib/db";
import type { GarmentKind } from "@/lib/garment-paths";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, formatPrice } from "@/lib/utils";

const GARMENT_FOR: Record<string, GarmentKind> = {
  "baby-boys": "dungaree",
  "baby-girls": "dress",
  newborn: "romper",
  "everyday-wear": "tee",
  "casual-outfits": "polo",
  "matching-sets": "tee",
  seasonal: "hoodie",
};
const FALLBACK_GARMENTS: GarmentKind[] = ["tee", "dress", "romper", "dungaree"];

export default async function Home() {
  const settings = await getSettings();
  const { home } = settings;
  const sec = home.sections;

  const [featuredCats, newArrivals, bestSellers, banners, gallery] = await Promise.all([
    db.category.findMany({
      where: { isVisible: true, isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
      include: {
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
        products: {
          where: { status: "ACTIVE" },
          orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
          take: 3,
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            compareAtPrice: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
            colors: { orderBy: { sortOrder: "asc" }, select: { name: true, hex: true } },
          },
        },
      },
    }),
    sec.newArrivals ? getProductsBy("isNewArrival", 10) : Promise.resolve([]),
    sec.bestSellers ? getProductsBy("isBestSeller", 8) : Promise.resolve([]),
    sec.banners ? db.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 2 }) : Promise.resolve([]),
    sec.gallery ? db.galleryImage.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 8 }) : Promise.resolve([]),
  ]);

  const trust = [
    "Ages 0–5",
    settings.payments.cod.enabled && "Cash on delivery",
    settings.shipping.freeThreshold > 0 && `Free delivery over ${formatPrice(settings.shipping.freeThreshold)}`,
  ].filter(Boolean) as string[];

  const marquee = [
    "Thoughtfully selected",
    "Newborn to five years",
    settings.payments.cod.enabled && "Cash on delivery",
    settings.policies.returnWindowDays > 0 && `Easy exchanges within ${settings.policies.returnWindowDays} days`,
    "Delivery across Pakistan",
  ].filter(Boolean) as string[];

  const wardrobe: WardrobeCategory[] = featuredCats.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    garment: GARMENT_FOR[c.slug] ?? FALLBACK_GARMENTS[i % FALLBACK_GARMENTS.length],
    products: c.products.map((p) => ({ ...p, image: p.images[0]?.url ?? null })),
  }));
  const showSample = settings.features.showSampleBadges;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.store.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logo-full.png"),
    sameAs: [settings.social.instagram, settings.social.facebook, settings.social.tiktok].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero content={home.hero} trust={trust} />
      <Marquee items={marquee} />

      {sec.categories && featuredCats.length > 0 && (
        <section className="container-kt py-24 md:py-32" aria-labelledby="cat-heading">
          <SectionHeader eyebrow="Shop by category" title="Dressed for every little stage" link={{ href: "/shop", label: "Shop all" }} />
          <FeaturedCategories categories={featuredCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, description: c.description, count: c._count.products }))} />
        </section>
      )}

      {sec.newArrivals && newArrivals.length > 0 && (
        <section className="container-kt pb-24 md:pb-32">
          <SectionHeader eyebrow="Just in" title="New Arrivals" body="Fresh pieces for the new season — soft colours, easy fits." link={{ href: "/collections/new-arrivals", label: "View all" }}>
            <RailControls target="rail-new" />
          </SectionHeader>
          <ProductRail id="rail-new" products={newArrivals} showSample={showSample} />
        </section>
      )}

      {sec.story && <BrandStory story={home.story} />}

      {sec.wardrobe && wardrobe.length > 0 && (
        <section className="container-kt py-24 md:py-32">
          <Wardrobe categories={wardrobe} />
        </section>
      )}

      {sec.bestSellers && bestSellers.length > 0 && (
        <section className="container-kt py-24 md:py-28">
          <SectionHeader eyebrow="Loved by little ones" title="Best Sellers" link={{ href: "/collections/best-sellers", label: "Shop best sellers" }} />
          <Reveal stagger={0.06} className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} showSample={showSample} />
            ))}
          </Reveal>
        </section>
      )}

      {sec.banners && banners.length > 0 && (
        <section className="container-kt pb-24 md:pb-32">
          <Banners banners={banners} />
        </section>
      )}

      {sec.benefits && home.benefits.length > 0 && (
        <section className="border-y border-cocoa-100 bg-cream-100 py-24 md:py-28">
          <div className="container-kt">
            <SectionHeader eyebrow="Why Kinder Thread?" title="Little things, done with care" align="center" />
            <Benefits items={home.benefits} />
          </div>
        </section>
      )}

      {sec.gallery && gallery.length > 0 && (
        <section className="container-kt py-24 md:py-32">
          <SectionHeader eyebrow={settings.social.instagramHandle || "Instagram"} title={home.gallery.heading} body={home.gallery.body}>
            {settings.social.instagram && (
              <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cocoa px-5 py-3 text-[0.88rem] font-bold text-cream-50 transition hover:bg-cocoa-800">
                Follow us
              </a>
            )}
          </SectionHeader>
          <Gallery images={gallery} instagram={settings.social.instagram} />
        </section>
      )}

      {sec.newsletter && <NewsletterSection heading={home.newsletter.heading} body={home.newsletter.body} />}
    </>
  );
}
