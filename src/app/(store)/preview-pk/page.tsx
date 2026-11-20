import type { Metadata } from "next";
import { NewsletterSection } from "@/components/home/newsletter";
import { AgeCircles } from "@/components/home/pk/age-circles";
import { BannerSlider, type Banner } from "@/components/home/pk/banner-slider";
import { CategoryGrid } from "@/components/home/pk/category-grid";
import { MobileTabBar } from "@/components/home/pk/mobile-tab-bar";
import { ProductTabs } from "@/components/home/pk/product-tabs";
import { PromoPair, WideBanner } from "@/components/home/pk/promo-banners";
import { TrustStrip, type TrustItem } from "@/components/home/trust-strip";
import { getProductsBy, toCard } from "@/lib/catalog";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { getSettings } from "@/lib/settings";
import { formatPrice, whatsappLink } from "@/lib/utils";

// Design preview only — not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Homepage preview", robots: { index: false, follow: false } };

const SLIDES: Banner[] = [
  { image: "/images/editorial/banner-knitwear.webp", imageAlt: "Soft knitwear on wooden hangers", eyebrow: "Fall / Winter '26", title: "The Winter *Edit*", body: "Cosy knits, cardigans and soft layers for chilly mornings.", ctaLabel: "Shop now", ctaHref: "/collections/seasonal", position: "50% 45%", mobilePosition: "30% 50%" },
  { image: "/images/editorial/nursery.webp", imageAlt: "A calm, light nursery with a white cot", eyebrow: "New season · Ages 0–5", title: "Little Moments, Big *Adventures*", body: "Thoughtfully selected outfits from their very first days to their biggest little adventures.", ctaLabel: "Explore collection", ctaHref: "/shop", position: "50% 55%", mobilePosition: "62% 50%", text: "dark" },
  { image: "/images/editorial/story-feet.webp", imageAlt: "A newborn's feet held in a parent's hands", eyebrow: "First days", title: "Newborn *Essentials*", body: "Gentle first pieces — bodysuits, knits and booties in the softest fabrics.", ctaLabel: "Shop newborn", ctaHref: "/collections/newborn", position: "50% 50%", mobilePosition: "55% 50%" },
  { image: "/images/editorial/cat-baby-girls.webp", imageAlt: "Little dresses drying on a washing line", eyebrow: "For little girls", title: "Dresses & *Delights*", body: "Occasion dresses, blouses and knits in soft, timeless colours.", ctaLabel: "Shop baby girls", ctaHref: "/collections/baby-girls", position: "50% 40%", mobilePosition: "50% 45%" },
];

const AGES = [
  { label: "Newborn", href: "/shop?age=newborn", image: "/images/gallery/g3.webp" },
  { label: "Baby", href: "/shop?age=baby", image: "/images/gallery/g2.webp" },
  { label: "Toddler", href: "/shop?age=toddler", image: "/images/gallery/g1.webp" },
  { label: "Little ones", href: "/shop?age=little", image: "/images/gallery/g5.webp" },
];

const inCategory = (slug: string) =>
  PRODUCTS.filter((p) => p.status === "ACTIVE" && p.categoryIds.includes(`cat_${slug}`))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toCard);

export default async function HomePreview() {
  const settings = await getSettings();
  const { shipping, payments, policies, store, home } = settings;
  const showSample = settings.features.showSampleBadges;
  const [newArrivals, bestSellers] = await Promise.all([getProductsBy("isNewArrival", 8), getProductsBy("isBestSeller", 8)]);

  const tiles = [
    ...CATEGORIES.filter((c) => c.isVisible && c.image)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ name: c.name.replace(" Collection", ""), href: `/collections/${c.slug}`, image: c.image! })),
    { name: "Best Sellers", href: "/collections/best-sellers", image: "/images/products/nordic-cardigan-rose.webp" },
  ].slice(0, 8);

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

  return (
    <>
      <BannerSlider slides={SLIDES} />

      <div className="pt-12 md:pt-16">
        <AgeCircles items={AGES} />
      </div>

      <div className="pt-16 md:pt-24">
        <CategoryGrid tiles={tiles} />
      </div>

      <div className="pt-16 md:pt-24">
        <ProductTabs
          id="new-heading"
          title="New *Arrivals*"
          body="Fresh pieces for the new season."
          showSample={showSample}
          tabs={[
            { label: "All", href: "/collections/new-arrivals", products: newArrivals },
            { label: "Girls", href: "/collections/baby-girls", products: inCategory("baby-girls") },
            { label: "Boys", href: "/collections/baby-boys", products: inCategory("baby-boys") },
            { label: "Newborn", href: "/collections/newborn", products: inCategory("newborn") },
          ]}
        />
      </div>

      <div className="pt-16 md:pt-24">
        <PromoPair
          items={[
            { eyebrow: "Soft & simple", title: "Everyday *Essentials*", ctaLabel: "Shop now", href: "/collections/everyday-wear", image: "/images/gallery/g7.webp" },
            { eyebrow: "The winter edit", title: "Warm *Knits*", ctaLabel: "Shop now", href: "/collections/seasonal", image: "/images/gallery/g5.webp" },
          ]}
        />
      </div>

      <div className="pt-16 md:pt-24">
        <ProductTabs id="best-heading" title="Best *Sellers*" body="The styles parents come back for." showSample={showSample} tabs={[{ label: "Best sellers", href: "/collections/best-sellers", products: bestSellers }]} />
      </div>

      <div className="pt-16 md:pt-24">
        <WideBanner
          eyebrow="Our promise"
          title="Soft fabrics, honest *sizing*"
          body="Every piece is chosen for comfort and sized by age — delivered across Pakistan, with cash on delivery."
          ctaLabel="Our story"
          href="/about"
          image="/images/editorial/story-muslin.webp"
          position="50% 55%"
        />
      </div>

      <div className="pt-14 md:pt-20">
        <TrustStrip items={trust} />
      </div>

      <div className="pt-16 md:pt-24">
        <NewsletterSection heading={home.newsletter.heading} body={home.newsletter.body} />
      </div>

      <MobileTabBar signedIn={false} />
    </>
  );
}
