import { cache } from "react";
import { z } from "zod";

/* -------------------------------------------------------------------------
   Every business-configurable value lives here, stored in the Setting table
   and edited from /admin. Defaults keep the site usable on a fresh database.
   ------------------------------------------------------------------------- */

const link = z.object({ label: z.string(), href: z.string() });

type SlideDefaults = { eyebrow: string; title: string; body: string; ctaLabel: string; ctaHref: string; image: string; imageAlt: string; position?: string; mobilePosition?: string; text?: "light" | "dark" };
/** One full-width photo banner slide (homepage and Shop page sliders). */
const slide = (d: SlideDefaults) =>
  z
    .object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().default(d.eyebrow),
      title: z.string().default(d.title),
      body: z.string().default(d.body),
      ctaLabel: z.string().default(d.ctaLabel),
      ctaHref: z.string().default(d.ctaHref),
      image: z.string().default(d.image),
      imageAlt: z.string().default(d.imageAlt),
      // which part of the photo stays in view ("50% 50%" = centre), and the text colour
      position: z.string().default(d.position ?? "50% 50%"),
      mobilePosition: z.string().default(d.mobilePosition ?? ""),
      text: z.enum(["light", "dark"]).default(d.text ?? "light"),
    })
    .prefault({});

export const settingSchemas = {
  store: z.object({
    name: z.string().default("Kinder Thread"),
    tagline: z.string().default("Kids Clothing Brand"),
    description: z
      .string()
      .default(
        "Thoughtfully selected outfits for little ones aged 0–5, from their very first days to their biggest little adventures.",
      ),
    email: z.string().default(""),
    phone: z.string().default(""),
    whatsapp: z.string().default(""),
    address: z.string().default(""),
    city: z.string().default("Pakistan"),
    hours: z.string().default("Mon–Sat, 10am – 7pm"),
  }),
  social: z.object({
    instagram: z.string().default(""),
    instagramHandle: z.string().default("@kinderthread"),
    facebook: z.string().default(""),
    tiktok: z.string().default(""),
  }),
  shipping: z.object({
    flatRate: z.number().int().min(0).default(250),
    freeThreshold: z.number().int().min(0).default(4000),
    estimate: z.string().default("3–5 working days across Pakistan"),
    note: z.string().default("Orders are dispatched within 1–2 working days after confirmation."),
  }),
  payments: z.object({
    cod: z
      .object({
        enabled: z.boolean().default(true),
        fee: z.number().int().min(0).default(0),
        instructions: z.string().default("Pay in cash when your parcel arrives. Please keep the exact amount ready."),
      })
      .prefault({}),
    bank: z
      .object({
        enabled: z.boolean().default(false),
        bankName: z.string().default(""),
        accountTitle: z.string().default(""),
        accountNumber: z.string().default(""),
        iban: z.string().default(""),
        instructions: z
          .string()
          .default("Transfer the order total and enter the transaction reference. We confirm your order once the payment is verified."),
      })
      .prefault({}),
    jazzcash: z
      .object({
        enabled: z.boolean().default(false),
        accountTitle: z.string().default(""),
        number: z.string().default(""),
        instructions: z.string().default("Send the order total to our JazzCash account and enter the transaction ID."),
      })
      .prefault({}),
    easypaisa: z
      .object({
        enabled: z.boolean().default(false),
        accountTitle: z.string().default(""),
        number: z.string().default(""),
        instructions: z.string().default("Send the order total to our Easypaisa account and enter the transaction ID."),
      })
      .prefault({}),
    card: z
      .object({
        // Online gateway — stays disabled until merchant credentials are configured and tested.
        enabled: z.boolean().default(false),
        provider: z.string().default(""),
        label: z.string().default("Debit / Credit card"),
      })
      .prefault({}),
  }),
  prelaunch: z.object({
    enabled: z.boolean().default(false),
    eyebrow: z.string().default("Opening soon"),
    heading: z.string().default("Little Moments. Big Adventures."),
    message: z
      .string()
      .default(
        "Our first collection is on its way. Leave your email and we'll let you know the moment the doors open.",
      ),
    launchDate: z.string().default(""),
  }),
  announcement: z.object({
    enabled: z.boolean().default(true),
    messages: z
      .array(z.object({ text: z.string(), href: z.string().optional().default("") }))
      .default([
        { text: "Welcome to Kinder Thread", href: "" },
        { text: "Discover little moments, beautifully dressed", href: "/shop" },
        { text: "Free delivery on orders above Rs. 4,000", href: "/pages/shipping" },
      ]),
  }),
  home: z.object({
    hero: z
      .object({
        eyebrow: z.string().default("New season · Ages 0–5"),
        heading: z.string().default("Little Moments. Big Adventures."),
        subheading: z
          .string()
          .default(
            "Discover thoughtfully selected outfits for your little ones, from their very first days to their biggest little adventures.",
          ),
        image: z.string().default("/images/editorial/hero-tulle.webp"),
        imageAlt: z.string().default("A toddler in a mint tulle dress sitting by a sunny window"),
        // a second, smaller photograph layered beside the main one (desktop)
        secondaryImage: z.string().default("/images/products/nordic-cardigan-rose.webp"),
        // product shown on the hero photograph (its live name and price are used)
        productSlug: z.string().default("tulle-party-dress"),
        // text that runs around the round badge on the hero photo
        badge: z.string().default("New season · Ages 0–5 · Kinder Thread · "),
        primary: link.default({ label: "Explore Collection", href: "/shop" }),
        secondary: link.default({ label: "Our Story", href: "/about" }),
      })
      .prefault({}),
    story: z
      .object({
        eyebrow: z.string().default("Our little world"),
        heading: z.string().default("Made for Little Moments."),
        body: z
          .string()
          .default(
            "Every little outfit is part of a bigger story. Discover thoughtfully selected styles for the little ones who make every moment special.",
          ),
        image: z.string().default("/images/editorial/story-muslin.webp"),
        imageAlt: z.string().default("Soft folded muslins stacked on a wooden stool"),
        image2: z.string().default("/images/editorial/story-feet.webp"),
        image2Alt: z.string().default("A parent holding a baby's tiny feet"),
        imagesAreSamples: z.boolean().default(false),
        cta: link.default({ label: "Read our story", href: "/about" }),
      })
      .prefault({}),
    // homepage banner slider: four full-width photo slides, each can be switched off.
    // Use *word* for the serif accent; text: "light" on darker photos, "dark" on light photos.
    slider: z
      .object({
        slide1: slide({ eyebrow: "Fall / Winter '26", title: "The Winter *Edit*", body: "Cosy knits, cardigans and soft layers for chilly mornings.", ctaLabel: "Shop now", ctaHref: "/collections/seasonal", image: "/images/editorial/banner-knitwear.webp", imageAlt: "Soft knitwear on wooden hangers", position: "50% 45%", mobilePosition: "30% 50%" }),
        slide2: slide({ eyebrow: "New season · Ages 0–5", title: "Little Moments, Big *Adventures*", body: "Thoughtfully selected outfits from their very first days to their biggest little adventures.", ctaLabel: "Explore collection", ctaHref: "/shop", image: "/images/editorial/nursery.webp", imageAlt: "A calm, light nursery with a white cot", position: "50% 55%", mobilePosition: "62% 50%", text: "dark" }),
        slide3: slide({ eyebrow: "First days", title: "Newborn *Essentials*", body: "Gentle first pieces — bodysuits, knits and booties in the softest fabrics.", ctaLabel: "Shop newborn", ctaHref: "/collections/newborn", image: "/images/editorial/story-feet.webp", imageAlt: "A newborn's feet held in a parent's hands", position: "50% 50%", mobilePosition: "55% 50%" }),
        slide4: slide({ eyebrow: "For little girls", title: "Dresses & *Delights*", body: "Occasion dresses, blouses and knits in soft, timeless colours.", ctaLabel: "Shop baby girls", ctaHref: "/collections/baby-girls", image: "/images/editorial/cat-baby-girls.webp", imageAlt: "Little dresses drying on a washing line", position: "50% 40%", mobilePosition: "50% 45%" }),
      })
      .prefault({}),
    // round photos in the homepage "Shop by age" row
    ages: z
      .object({
        newborn: z.string().default("/images/gallery/g3.webp"),
        baby: z.string().default("/images/gallery/g2.webp"),
        toddler: z.string().default("/images/gallery/g1.webp"),
        little: z.string().default("/images/gallery/g5.webp"),
      })
      .prefault({}),
    // full-width photo banner lower on the homepage
    brandBanner: z
      .object({
        eyebrow: z.string().default("Our promise"),
        title: z.string().default("Soft fabrics, honest *sizing*"),
        body: z.string().default("Every piece is chosen for comfort and sized by age — delivered across Pakistan, with cash on delivery."),
        ctaLabel: z.string().default("Our story"),
        ctaHref: z.string().default("/about"),
        image: z.string().default("/images/editorial/story-muslin.webp"),
        position: z.string().default("50% 55%"),
      })
      .prefault({}),
    // photo banner slider at the top of the Shop page
    shopSlider: z
      .object({
        slide1: slide({ eyebrow: "Just in", title: "New *Arrivals*", body: "Fresh pieces for the new season — soft colours, easy fits.", ctaLabel: "Shop new arrivals", ctaHref: "/collections/new-arrivals", image: "/images/editorial/cat-everyday.webp", imageAlt: "Colourful little outfits on a clothing rail", position: "50% 45%", mobilePosition: "60% 45%", text: "dark" }),
        slide2: slide({ eyebrow: "The winter edit", title: "Warm *Knits*", body: "Cardigans, bloomers and beanies for chilly mornings.", ctaLabel: "Shop knitwear", ctaHref: "/collections/seasonal", image: "/images/editorial/cat-seasonal.webp", imageAlt: "Close-up of a striped hand-knit sweater", position: "50% 50%" }),
        slide3: slide({ eyebrow: "Easy outfits", title: "Matching *Sets*", body: "Coordinated pieces that work together — one less decision in the morning.", ctaLabel: "Shop sets", ctaHref: "/collections/matching-sets", image: "/images/editorial/cat-matching-sets.webp", imageAlt: "A little outfit laid flat with sandals and a wooden toy camera", position: "50% 40%", text: "dark" }),
      })
      .prefault({}),
    // seasonal campaign / sale slot (Eid, 11.11, winter sale…) — off until you switch it on
    promo: z
      .object({
        enabled: z.boolean().default(false),
        eyebrow: z.string().default("Eid edit"),
        title: z.string().default("Dressed for Eid"),
        body: z.string().default("Festive outfits for little ones, ready to ship across Pakistan."),
        ctaLabel: z.string().default("Shop the edit"),
        ctaHref: z.string().default("/collections/new-arrivals"),
        endsAt: z.string().default(""),
        image: z.string().default("/images/editorial/cat-baby-girls.webp"),
      })
      .prefault({}),
    benefits: z
      .array(z.object({ title: z.string(), body: z.string(), icon: z.string(), image: z.string().default("") }))
      .default([
        { icon: "sparkles", title: "Carefully selected styles", body: "Every piece is chosen by hand for colour, cut and everyday practicality.", image: "/images/products/lace-dress-ivory-2.webp" },
        { icon: "feather", title: "Comfortable everyday outfits", body: "Soft, easy-on pieces made for crawling, playing, napping and growing.", image: "/images/products/sleepsuit-set.webp" },
        { icon: "bag", title: "Convenient shopping", body: "Clear sizes by age, simple filters and a checkout that takes a minute.", image: "/images/gallery/g7.webp" },
        { icon: "chat", title: "Friendly customer support", body: "Questions about sizing or an order? Message us on WhatsApp or email.", image: "/images/products/crochet-booties-cream.webp" },
        { icon: "truck", title: "Easy ordering & delivery", body: "Cash on delivery, delivery across Pakistan and online order tracking.", image: "/images/editorial/banner-knitwear.webp" },
      ]),
    newsletter: z
      .object({
        heading: z.string().default("Be Part of Our Little World."),
        body: z.string().default("New arrivals, restock alerts and styling ideas for little ones. No spam — unsubscribe anytime."),
      })
      .prefault({}),
    gallery: z
      .object({
        heading: z.string().default("Follow Our Little World"),
        body: z.string().default("Behind-the-scenes, new arrivals and styling ideas."),
      })
      .prefault({}),
    sections: z
      .object({
        shopByAge: z.boolean().default(true),
        categories: z.boolean().default(true),
        newArrivals: z.boolean().default(true),
        banners: z.boolean().default(true),
        bestSellers: z.boolean().default(true),
        brandBanner: z.boolean().default(true),
        trust: z.boolean().default(true),
        gallery: z.boolean().default(false),
        newsletter: z.boolean().default(true),
      })
      .prefault({}),
  }),
  policies: z.object({
    returnWindowDays: z.number().int().min(0).default(7),
    returnsSummary: z
      .string()
      .default("Unworn items with tags can be returned or exchanged within 7 days of delivery."),
    codSummary: z.string().default("Cash on delivery is available across Pakistan."),
    careDefault: z.string().default("Machine wash cold, inside out. Do not bleach. Tumble dry low or line dry in shade."),
  }),
  seo: z.object({
    title: z.string().default("Kinder Thread — Kids Clothing, Ages 0–5"),
    description: z
      .string()
      .default(
        "Thoughtfully selected baby and kids clothing in Pakistan. Newborn, baby boys and baby girls outfits, everyday wear and matching sets for ages 0–5.",
      ),
    keywords: z.string().default("kids clothing Pakistan, baby clothes, newborn clothes, baby boy outfits, baby girl dresses"),
  }),
  features: z.object({
    tryOn: z.boolean().default(false),
    smoothScroll: z.boolean().default(true),
    showSampleBadges: z.boolean().default(true),
  }),
} as const;

export type SettingKey = keyof typeof settingSchemas;
export type Settings = { [K in SettingKey]: z.infer<(typeof settingSchemas)[K]> };

/**
 * Frontend-only build: settings come from the defaults above (edit them here).
 * When the MongoDB backend is connected, load the saved values and merge them in.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(settingSchemas) as SettingKey[]) out[key] = settingSchemas[key].parse({});
  return out as Settings;
});

/** Validates a settings object. Nothing is persisted in the frontend-only build. */
export async function saveSetting<K extends SettingKey>(key: K, value: unknown) {
  return settingSchemas[key].parse(value) as Settings[K];
}
