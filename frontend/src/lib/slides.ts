import type { Banner } from "@/components/home/banner-slider";
import type { Settings } from "@/lib/settings";

type SlideGroup = Settings["home"]["slider"] | Settings["home"]["shopSlider"];

/** The photo banner slides from settings (enabled ones with a heading and a photo). */
export function buildBanners(group: SlideGroup): Banner[] {
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
