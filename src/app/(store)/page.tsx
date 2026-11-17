import { Banners } from "@/components/home/banners";
import { Benefits } from "@/components/home/benefits";
import { BrandStory } from "@/components/home/brand-story";
import { FeaturedCategories } from "@/components/home/categories";
import { Gallery } from "@/components/home/gallery";
import { Hero } from "@/components/home/hero";
import { NewsletterSection } from "@/components/home/newsletter";
import { ProductRail, RailControls } from "@/components/home/product-rail";
import { SectionHeader } from "@/components/home/section-header";
import { ServiceBar, type ServiceItem } from "@/components/home/service-bar";
import { ShopByAge } from "@/components/home/shop-by-age";
import { ProductCard } from "@/components/product/product-card";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { countProductsInCategory, getProductsBy } from "@/lib/catalog";
import { CATEGORIES } from "@/data/catalog";
import { BANNERS, GALLERY } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, formatPrice } from "@/lib/utils";

export default async function Home() {
  const settings = await getSettings();
  const { home } = settings;
  const sec = home.sections;

  const featuredCats = CATEGORIES.filter((c) => c.isVisible && c.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);
  const [newArrivals, bestSellers] = await Promise.all([
    sec.newArrivals ? getProductsBy("isNewArrival", 10) : Promise.resolve([]),
    sec.bestSellers ? getProductsBy("isBestSeller", 8) : Promise.resolve([]),
  ]);
  const banners = sec.banners ? BANNERS.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2) : [];
  const gallery = sec.gallery ? GALLERY.filter((g) => g.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8) : [];

  const trust = [
    "Ages 0–5",
    settings.payments.cod.enabled && "Cash on delivery",
    settings.shipping.freeThreshold > 0 && `Free delivery over ${formatPrice(settings.shipping.freeThreshold)}`,
  ].filter(Boolean) as string[];

  const service: ServiceItem[] = [
    settings.shipping.freeThreshold > 0 ? { icon: "truck" as const, label: `Free delivery over ${formatPrice(settings.shipping.freeThreshold)}` } : { icon: "truck" as const, label: "Delivery across Pakistan" },
    settings.payments.cod.enabled && { icon: "cash" as const, label: "Cash on delivery" },
    settings.policies.returnWindowDays > 0 && { icon: "exchange" as const, label: `${settings.policies.returnWindowDays}-day exchanges` },
    { icon: "ruler" as const, label: "Sizes 0–5 years" },
  ].filter(Boolean) as ServiceItem[];

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
      <ServiceBar items={service} />

      {sec.categories && featuredCats.length > 0 && (
        <section className="container-kt py-24 md:py-32" aria-labelledby="cat-heading">
          <SectionHeader eyebrow="Shop by category" title="Dressed for every little stage" link={{ href: "/shop", label: "Shop all" }} />
          <FeaturedCategories categories={featuredCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, description: c.description, count: countProductsInCategory(c.id) }))} />
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

      {sec.shopByAge && (
        <section className="container-kt py-24 md:py-28">
          <SectionHeader eyebrow="Shop by age" title="Every size, every little stage" link={{ href: "/size-guide", label: "Size guide" }} />
          <ShopByAge />
        </section>
      )}

      {sec.bestSellers && bestSellers.length > 0 && (
        <section className="container-kt py-24 md:py-28">
          <SectionHeader eyebrow="Loved by little ones" title="Best Sellers" link={{ href: "/collections/best-sellers", label: "Shop best sellers" }} />
          <Reveal stagger={0.06} className="grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-5 lg:grid-cols-4">
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
        <section className="py-24 md:py-28">
          <div className="container-kt">
            <SectionHeader eyebrow="Why Kinder Thread?" title="Little things, done with care" />
            <Benefits items={home.benefits} />
          </div>
        </section>
      )}

      {sec.gallery && gallery.length > 0 && (
        <section className="container-kt py-24 md:py-32">
          <SectionHeader eyebrow={settings.social.instagram ? settings.social.instagramHandle || "Instagram" : "Gallery"} title={home.gallery.heading} body={home.gallery.body}>
            {settings.social.instagram && (
              <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md")}>
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
