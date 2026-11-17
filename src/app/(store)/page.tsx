import { Banners } from "@/components/home/banners";
import { Benefits } from "@/components/home/benefits";
import { BrandStory } from "@/components/home/brand-story";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { EditRing } from "@/components/home/edit-ring";
import { Gallery } from "@/components/home/gallery";
import { Hero, type HeroSlide } from "@/components/home/hero";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { NewsletterSection } from "@/components/home/newsletter";
import { ScrubStatement } from "@/components/home/scrub-statement";
import { SectionHeader } from "@/components/home/section-header";
import { ShopByAge } from "@/components/home/shop-by-age";
import { VelocityMarquee } from "@/components/home/velocity-marquee";
import { ProductCard } from "@/components/product/product-card";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { countProductsInCategory, getProductsBy, VIRTUAL_COLLECTIONS } from "@/lib/catalog";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import { BANNERS, GALLERY } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";

// photographs for the marquee strip (small copies)
const MARQUEE_IMAGES = ["/images/hero/h1.webp", "/images/hero/h4.webp", "/images/hero/h7.webp", "/images/hero/h5.webp", "/images/hero/h2.webp"];

// products shown in the hero slideshow (photo + live name/price from the catalogue)
const HERO_PRODUCTS: { slug: string; image?: string }[] = [
  { slug: "tulle-party-dress", image: "/images/editorial/hero-tulle.webp" },
  { slug: "nordic-yoke-cardigan" },
  { slug: "lace-occasion-dress" },
  { slug: "cable-knit-bloomers" },
  { slug: "hand-crochet-booties" },
];

export default async function Home() {
  const settings = await getSettings();
  const { home } = settings;
  const sec = home.sections;

  const visibleCats = CATEGORIES.filter((c) => c.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const indexCats = visibleCats.filter((c) => c.kind === "category").slice(0, 6);
  const [newArrivals, bestSellers] = await Promise.all([
    sec.newArrivals ? getProductsBy("isNewArrival", 10) : Promise.resolve([]),
    sec.bestSellers ? getProductsBy("isBestSeller", 8) : Promise.resolve([]),
  ]);
  const banners = sec.banners ? BANNERS.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 2) : [];
  const gallery = sec.gallery ? GALLERY.filter((g) => g.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8) : [];

  const ringItems = [
    ...Object.entries(VIRTUAL_COLLECTIONS)
      .filter(([slug]) => slug !== "sale")
      .map(([slug, v]) => ({ src: `/images/ring/${slug}.webp`, href: `/collections/${slug}`, label: v.name, description: v.description })),
    ...visibleCats.map((c) => ({ src: `/images/ring/${c.slug}.webp`, href: `/collections/${c.slug}`, label: c.name, description: c.description })),
  ];

  const slides: HeroSlide[] = HERO_PRODUCTS.flatMap(({ slug, image }) => {
    const p = PRODUCTS.find((x) => x.slug === slug && x.status === "ACTIVE");
    if (!p) return [];
    const cat = CATEGORIES.find((c) => p.categoryIds.includes(c.id));
    return [{ image: image ?? p.images[0]?.url ?? "", href: `/products/${p.slug}`, name: p.name, label: cat?.name ?? "New in", price: p.price, compareAt: p.compareAtPrice, isSample: p.isSample }];
  }).filter((s) => s.image);

  const marquee = home.marquee.map((text, i) => ({ text, image: i % 2 === 0 ? MARQUEE_IMAGES[(i / 2) % MARQUEE_IMAGES.length] : undefined }));
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
      <Hero content={home.hero} slides={slides} badge={home.hero.badge} />

      <div id="after-hero" className="scroll-mt-24" />
      {sec.marquee && marquee.length > 0 && <VelocityMarquee pieces={marquee} className="border-y border-cocoa/[0.07] py-6 md:py-8" />}

      {sec.statement && home.statement.text && (
        <section className="container-kt py-28 md:py-44">
          <ScrubStatement eyebrow={home.statement.eyebrow} text={home.statement.text} images={home.statement.images} />
        </section>
      )}

      {sec.categories && indexCats.length > 0 && (
        <section className="container-kt pb-28 md:pb-40" aria-labelledby="cat-heading">
          <SectionHeader eyebrow="Shop by category" title="Dressed for every *little* stage" link={{ href: "/shop", label: "Shop all" }} />
          <CategoryShowcase categories={indexCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, description: c.description, count: countProductsInCategory(c.id) }))} />
        </section>
      )}

      {sec.newArrivals && newArrivals.length > 0 && (
        <HorizontalShowcase
          eyebrow="Just in"
          title="New"
          accent="Arrivals"
          body="Fresh pieces for the new season — soft colours, easy fits."
          link={{ href: "/collections/new-arrivals", label: "View all new" }}
          products={newArrivals}
          showSample={showSample}
        />
      )}

      {sec.story && (
        <div className="pt-28 md:pt-40">
          <BrandStory story={home.story} />
        </div>
      )}

      {sec.edit && ringItems.length >= 5 && (
        <div className="px-2.5 pt-28 md:px-4 md:pt-40">
          <EditRing items={ringItems} eyebrow="The edit" title="Explore every" accent="collection" />
        </div>
      )}

      {sec.shopByAge && (
        <section className="container-kt pt-28 md:pt-40">
          <SectionHeader eyebrow="Shop by age" title="Every size, every *little* stage" link={{ href: "/size-guide", label: "Size guide" }} />
          <ShopByAge />
        </section>
      )}

      {sec.bestSellers && bestSellers.length > 0 && (
        <section className="container-kt pt-28 md:pt-40">
          <SectionHeader eyebrow="Loved by little ones" title="Best *Sellers*" link={{ href: "/collections/best-sellers", label: "Shop best sellers" }} />
          <Reveal stagger={0.06} className="grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-5 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} showSample={showSample} />
            ))}
          </Reveal>
        </section>
      )}

      {sec.banners && banners.length > 0 && (
        <section className="container-kt pt-28 md:pt-40">
          <Banners banners={banners} />
        </section>
      )}

      {sec.benefits && home.benefits.length > 0 && (
        <section className="pt-28 md:pt-40">
          <div className="mx-2.5 rounded-[2rem] bg-cream-100 px-3 py-16 md:mx-4 md:rounded-[3rem] md:px-0 md:py-28">
            <div className="container-kt max-md:px-2">
              <SectionHeader eyebrow="Why Kinder Thread?" title="Little things, done with *care*" body="What you can expect every time you shop with us — from choosing a size to the moment the parcel arrives." />
              <Benefits items={home.benefits} />
            </div>
          </div>
        </section>
      )}

      {sec.gallery && gallery.length > 0 && (
        <section className="container-kt pt-28 md:pt-40">
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
        <div className="pt-24 md:pt-36">
          <NewsletterSection heading={home.newsletter.heading} body={home.newsletter.body} />
        </div>
      )}
    </>
  );
}
