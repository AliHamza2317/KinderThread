import type { Slide } from "@/components/home/hero-slider";
import type { Banner } from "@/components/home/banner-slider";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
import type { Settings } from "@/lib/settings";

type SlideGroup = Settings["home"]["slider"] | Settings["home"]["shopSlider"];

/** Turns the slide slots from settings into slider slides (enabled ones only), resolving product cards. */
export function buildSlides(group: SlideGroup): Slide[] {
  return Object.values(group)
    .filter((s) => s.enabled && s.title.trim() && s.image.trim())
    .map((s) => {
      const p = s.productSlug ? PRODUCTS.find((x) => x.slug === s.productSlug && x.status === "ACTIVE") : undefined;
      const cat = p ? CATEGORIES.find((c) => p.categoryIds.includes(c.id)) : undefined;
      return {
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        ctaLabel: s.ctaLabel,
        ctaHref: s.ctaHref,
        secondaryLabel: s.secondaryLabel,
        secondaryHref: s.secondaryHref,
        image: s.image,
        imageAlt: s.imageAlt,
        cutout: s.cutout || undefined,
        align: s.align,
        tone: s.tone,
        product: p ? { href: `/products/${p.slug}`, name: p.name, label: cat?.name ?? "New in", image: p.images[0]?.url ?? s.image, price: p.price, compareAt: p.compareAtPrice, isSample: p.isSample } : null,
      };
    });
}

/** The homepage photo banner slides from settings (enabled ones with a heading and a photo). */
export function buildBanners(group: Settings["home"]["slider"]): Banner[] {
  return Object.values(group)
    .filter((s) => s.enabled && s.title.trim() && s.image.trim())
    .map((s) => ({
      image: s.image,
      imageAlt: s.imageAlt,
      position: s.position || undefined,
      mobilePosition: s.mobilePosition || undefined,
      eyebrow: s.eyebrow,
      title: s.title,
      body: s.body || undefined,
      ctaLabel: s.ctaLabel,
      ctaHref: s.ctaHref,
      text: s.text,
    }));
}
