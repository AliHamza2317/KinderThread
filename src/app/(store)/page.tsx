import { Banners } from "@/components/home/banners";
import { Benefits } from "@/components/home/benefits";
import { BrandStory } from "@/components/home/brand-story";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { Gallery } from "@/components/home/gallery";
import { AgeChips } from "@/components/home/age-chips";
import { HeroSlider } from "@/components/home/hero-slider";
import { NewsletterSection } from "@/components/home/newsletter";
import { ProductRow } from "@/components/home/product-row";
import { PromoBanner } from "@/components/home/promo-banner";
import { SectionHeader } from "@/components/home/section-header";
import { ShopByAge } from "@/components/home/shop-by-age";
import { TrustStrip, type TrustItem } from "@/components/home/trust-strip";
import { ProductCard } from "@/components/product/product-card";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { countProductsInCategory, getProductsBy } from "@/lib/catalog";
import { CATEGORIES } from "@/data/catalog";
import { BANNERS, GALLERY } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { buildSlides } from "@/lib/slides";
import { absoluteUrl, formatPrice, whatsappLink } from "@/lib/utils";

export default async function Home() {
  const settings = await getSettings();
  const { home, store, shipping, payments, policies } = settings;
  const sec = home.sections;

  const visibleCats = CATEGORIES.filter((c) => c.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const showcaseCats = visibleCats.filter((c) => c.kind === "category").slice(0, 6);
  const [newArrivals, bestSellers] = await Promise.all([
    sec.newArrivals ? getProductsBy("isNewArrival", 10) : Promise.resolve([]),
    sec.bestSellers ? getProductsBy("isBestSeller", 8) : Promise.resolve([]),
  ]);
  const banners = sec.banners ? BANNERS.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2) : [];
  const gallery = sec.gallery ? GALLERY.filter((g) => g.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8) : [];
  const showSample = settings.features.showSampleBadges;

  const slides = buildSlides(home.slider);

  const trust: TrustItem[] = [
    payments.cod.enabled && { icon: "cash" as const, title: "Cash on delivery", body: "Pay when your parcel arrives" },
    shipping.freeThreshold > 0
      ? { icon: "truck" as const, title: `Free delivery over ${formatPrice(shipping.freeThreshold)}`, body: shipping.estimate, href: "/pages/shipping" }
      : { icon: "truck" as const, title: "Delivery across Pakistan", body: shipping.estimate, href: "/pages/shipping" },
    policies.returnWindowDays > 0 && { icon: "exchange" as const, title: `${policies.returnWindowDays}-day easy exchange`, body: "Unworn, with tags", href: "/pages/returns" },
    store.whatsapp
      ? { icon: "chat" as const, title: "Help on WhatsApp", body: "Sizing and order questions", href: whatsappLink(store.whatsapp, "Hi Kinder Thread!"), external: true }
      : { icon: "ruler" as const, title: "Sized by age", body: "Clear size guide, 0–5 years", href: "/size-guide" },
  ].filter(Boolean) as TrustItem[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logo-full.png"),
    sameAs: [settings.social.instagram, settings.social.facebook, settings.social.tiktok].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSlider slides={slides} />
      <AgeChips />

      {sec.trust && <TrustStrip items={trust} />}

      {sec.newArrivals && newArrivals.length > 0 && (
        <div className="pt-24 md:pt-32">
          <ProductRow
            eyebrow="Just in"
            title="New *Arrivals*"
            body="Fresh pieces for the new season — soft colours, easy fits."
            link={{ href: "/collections/new-arrivals", label: "View all" }}
            products={newArrivals}
            showSample={showSample}
          />
        </div>
      )}

      {sec.categories && showcaseCats.length > 0 && (
        <section className="container-kt pt-24 md:pt-32" aria-labelledby="cat-heading">
          <SectionHeader id="cat-heading" eyebrow="Shop by category" title="Dressed for every *little* stage" link={{ href: "/shop", label: "Shop all" }} />
          <CategoryShowcase categories={showcaseCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, description: c.description, count: countProductsInCategory(c.id) }))} />
        </section>
      )}

      {home.promo.enabled && home.promo.title && (
        <div className="pt-24 md:pt-32">
          <PromoBanner promo={home.promo} />
        </div>
      )}

      {sec.shopByAge && (
        <section className="container-kt pt-24 md:pt-32">
          <SectionHeader eyebrow="Shop by age" title="Every size, every *little* stage" link={{ href: "/size-guide", label: "Size guide" }} />
          <ShopByAge />
        </section>
      )}

      {sec.story && (
        <div className="pt-24 md:pt-32">
          <BrandStory story={home.story} />
        </div>
      )}

      {sec.bestSellers && bestSellers.length > 0 && (
        <section className="container-kt pt-24 md:pt-32">
          <SectionHeader eyebrow="Loved by little ones" title="Best *Sellers*" link={{ href: "/collections/best-sellers", label: "Shop best sellers" }} />
          <Reveal stagger={0.06} className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4 max-md:[&>*:nth-child(n+5)]:hidden">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} showSample={showSample} />
            ))}
          </Reveal>
        </section>
      )}

      {banners.length > 0 && (
        <section className="container-kt pt-24 md:pt-32">
          <Banners banners={banners} />
        </section>
      )}

      {sec.benefits && home.benefits.length > 0 && (
        <section className="pt-24 md:pt-32">
          <div className="mx-2.5 rounded-[2rem] bg-cream-100 px-3 py-14 md:mx-4 md:rounded-[3rem] md:px-0 md:py-24">
            <div className="container-kt max-md:px-2">
              <SectionHeader eyebrow="Why Kinder Thread?" title="Little things, done with *care*" body="What you can expect every time you shop with us — from choosing a size to the moment the parcel arrives." />
              <Benefits items={home.benefits} />
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="container-kt pt-24 md:pt-32">
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

      {sec.newsletter && (
        <div className="pt-24 md:pt-32">
          <NewsletterSection heading={home.newsletter.heading} body={home.newsletter.body} />
        </div>
      )}
    </>
  );
}
