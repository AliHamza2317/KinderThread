import { AgeCircles } from "@/components/home/age-circles";
import { BannerSlider } from "@/components/home/banner-slider";
import { CategoryGrid } from "@/components/home/category-grid";
import { Gallery } from "@/components/home/gallery";
import { NewsletterSection } from "@/components/home/newsletter";
import { ProductTabs } from "@/components/home/product-tabs";
import { PromoBanner } from "@/components/home/promo-banner";
import { PromoPair, WideBanner } from "@/components/home/promo-banners";
import { SectionHeader } from "@/components/home/section-header";
import { TrustStrip, type TrustItem } from "@/components/home/trust-strip";
import { buttonClass } from "@/components/ui/button";
import { getProductsBy, toCard } from "@/lib/catalog";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { BANNERS, GALLERY } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { buildBanners } from "@/lib/slides";
import { absoluteUrl, formatPrice, whatsappLink } from "@/lib/utils";

const inCategory = (slug: string, take = 8) =>
  PRODUCTS.filter((p) => p.status === "ACTIVE" && p.categoryIds.includes(`cat_${slug}`))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, take)
    .map(toCard);

/**
 * Homepage laid out the way Pakistani kidswear stores do it: a full-width photo banner
 * slider, shop by age and by category straight away, product grids with tabs and a
 * "View all" button, two promo banners, a brand banner, trust points and the newsletter.
 */
export default async function Home() {
  const settings = await getSettings();
  const { home, store, shipping, payments, policies } = settings;
  const sec = home.sections;
  const showSample = settings.features.showSampleBadges;

  const [newArrivals, bestSellers] = await Promise.all([
    sec.newArrivals ? getProductsBy("isNewArrival", 8) : Promise.resolve([]),
    sec.bestSellers ? getProductsBy("isBestSeller", 8) : Promise.resolve([]),
  ]);

  const ages = [
    { label: "Newborn", href: "/shop?age=newborn", image: home.ages.newborn },
    { label: "Baby", href: "/shop?age=baby", image: home.ages.baby },
    { label: "Toddler", href: "/shop?age=toddler", image: home.ages.toddler },
    { label: "Little ones", href: "/shop?age=little", image: home.ages.little },
  ].filter((a) => a.image);

  const tiles = [
    ...CATEGORIES.filter((c) => c.isVisible && c.image)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ name: c.name.replace(/ Collection$/, ""), href: `/collections/${c.slug}`, image: c.image! })),
    { name: "Best Sellers", href: "/collections/best-sellers", image: bestSellers[0]?.images[0]?.url ?? "/images/products/nordic-cardigan-rose.webp" },
  ].slice(0, 8);

  const newTabs = [
    { label: "All", href: "/collections/new-arrivals", products: newArrivals },
    { label: "Girls", href: "/collections/baby-girls", products: inCategory("baby-girls") },
    { label: "Boys", href: "/collections/baby-boys", products: inCategory("baby-boys") },
    { label: "Newborn", href: "/collections/newborn", products: inCategory("newborn") },
  ].filter((t) => t.products.length > 0);

  const promos = sec.banners
    ? BANNERS.filter((b) => b.isActive && b.image && b.ctaHref)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 2)
        .map((b) => ({ eyebrow: b.eyebrow ?? "", title: b.title, ctaLabel: b.ctaLabel || "Shop now", href: b.ctaHref!, image: b.image! }))
    : [];
  const gallery = sec.gallery ? GALLERY.filter((g) => g.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8) : [];

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
      <BannerSlider slides={buildBanners(home.slider)} />

      {sec.shopByAge && ages.length > 0 && (
        <div className="pt-12 md:pt-16">
          <AgeCircles items={ages} />
        </div>
      )}

      {sec.categories && tiles.length > 0 && (
        <div className="pt-16 md:pt-24">
          <CategoryGrid tiles={tiles} />
        </div>
      )}

      {sec.newArrivals && newTabs.length > 0 && (
        <div className="pt-16 md:pt-24">
          <ProductTabs id="new-heading" title="New *Arrivals*" body="Fresh pieces for the new season." showSample={showSample} tabs={newTabs} />
        </div>
      )}

      {promos.length > 0 && (
        <div className="pt-16 md:pt-24">
          <PromoPair items={promos} />
        </div>
      )}

      {home.promo.enabled && home.promo.title && (
        <div className="pt-16 md:pt-24">
          <PromoBanner promo={home.promo} />
        </div>
      )}

      {sec.bestSellers && bestSellers.length > 0 && (
        <div className="pt-16 md:pt-24">
          <ProductTabs id="best-heading" title="Best *Sellers*" body="The styles parents come back for." showSample={showSample} tabs={[{ label: "Best sellers", href: "/collections/best-sellers", products: bestSellers }]} />
        </div>
      )}

      {sec.brandBanner && home.brandBanner.title && home.brandBanner.image && (
        <div className="pt-16 md:pt-24">
          <WideBanner
            eyebrow={home.brandBanner.eyebrow}
            title={home.brandBanner.title}
            body={home.brandBanner.body}
            ctaLabel={home.brandBanner.ctaLabel}
            href={home.brandBanner.ctaHref}
            image={home.brandBanner.image}
            position={home.brandBanner.position}
          />
        </div>
      )}

      {sec.trust && trust.length > 0 && (
        <div className="pt-14 md:pt-20">
          <TrustStrip items={trust} />
        </div>
      )}

      {gallery.length > 0 && (
        <section className="container-kt pt-16 md:pt-24">
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
        <div className="pt-16 md:pt-24">
          <NewsletterSection heading={home.newsletter.heading} body={home.newsletter.body} />
        </div>
      )}

    </>
  );
}
