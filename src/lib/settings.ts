import "server-only";
import { cache } from "react";
import { z } from "zod";
import { db } from "@/lib/db";

/* -------------------------------------------------------------------------
   Every business-configurable value lives here, stored in the Setting table
   and edited from /admin. Defaults keep the site usable on a fresh database.
   ------------------------------------------------------------------------- */

const link = z.object({ label: z.string(), href: z.string() });

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
    benefits: z
      .array(z.object({ title: z.string(), body: z.string(), icon: z.string() }))
      .default([
        { icon: "sparkles", title: "Carefully selected styles", body: "Every piece is chosen by hand for colour, cut and everyday practicality." },
        { icon: "feather", title: "Comfortable everyday outfits", body: "Soft, easy-on pieces made for crawling, playing, napping and growing." },
        { icon: "bag", title: "Convenient shopping", body: "Clear sizes by age, simple filters and a checkout that takes a minute." },
        { icon: "chat", title: "Friendly customer support", body: "Questions about sizing or an order? Message us on WhatsApp or email." },
        { icon: "truck", title: "Easy ordering & delivery", body: "Cash on delivery, delivery across Pakistan and online order tracking." },
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
        categories: z.boolean().default(true),
        newArrivals: z.boolean().default(true),
        story: z.boolean().default(true),
        shopByAge: z.boolean().default(true),
        bestSellers: z.boolean().default(true),
        banners: z.boolean().default(true),
        benefits: z.boolean().default(true),
        gallery: z.boolean().default(true),
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

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(settingSchemas) as SettingKey[]) {
    const parsed = settingSchemas[key].safeParse(map.get(key) ?? {});
    out[key] = parsed.success ? parsed.data : settingSchemas[key].parse({});
  }
  return out as Settings;
});

export async function saveSetting<K extends SettingKey>(key: K, value: unknown) {
  const parsed = settingSchemas[key].parse(value) as Settings[K];
  await db.setting.upsert({
    where: { key },
    create: { key, value: parsed as object },
    update: { value: parsed as object },
  });
  return parsed;
}
