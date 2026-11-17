/**
 * Seeds a fresh database with:
 *  - categories & collections, a default size guide, CMS pages
 *  - SAMPLE products (flagged isSample, images tagged "SAMPLE")
 *  - homepage banners & gallery (sample imagery), two example coupons
 *  - the first administrator (ADMIN_EMAIL / ADMIN_PASSWORD)
 *
 * Safe to re-run: existing records are left untouched.
 *   npm run db:seed
 *
 * Replace previously seeded sample content (sample products, and any category /
 * banner / gallery images that still point at old sample files) with the current set:
 *   npm run db:seed -- --refresh-samples
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { SAMPLE_BANNERS, SAMPLE_CATEGORIES, SAMPLE_GALLERY, SAMPLE_PRODUCTS } from "./sample-data";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// deterministic pseudo-random so stock levels are stable between runs
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const PAGES: { slug: string; title: string; body: string; seoDescription: string; showInFooter?: boolean }[] = [
  {
    slug: "shipping",
    title: "Shipping & Delivery",
    seoDescription: "Delivery charges, timelines and cash on delivery for Kinder Thread orders across Pakistan.",
    body: `We deliver across Pakistan.

## Delivery charges
- Standard delivery: **{{flatRate}}** per order
- **Free delivery** on orders of {{freeThreshold}} or more

## Delivery time
{{estimate}}. {{dispatchNote}}

## Cash on delivery
Cash on delivery is available on all orders. Please keep the exact amount ready when your parcel arrives.

## Tracking your order
Once your order ships you'll receive the courier name and tracking number. You can check your order at any time on the [Track Order](/track-order) page using your order number and phone number.

> Please review this policy and update the details to match your courier agreement before launch.`,
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    seoDescription: "How to return or exchange Kinder Thread items.",
    body: `We want every outfit to fit just right.

## Our policy
- You can request a return or exchange within **{{returnDays}} days** of delivery.
- Items must be unworn, unwashed and have their original tags attached.
- For hygiene reasons, items marked as final sale cannot be returned.

## How to request
1. If you have an account, open the order in **My Account → Orders** and choose *Request return / exchange*.
2. Otherwise, contact us with your order number and we'll guide you.

## Exchanges
Need a different size? We'll arrange an exchange for the same item, subject to availability.

## Refunds
Approved refunds are processed to your original payment method or by bank transfer for cash on delivery orders.

> Please review this policy before launch.`,
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    seoDescription: "Answers to common questions about sizing, delivery, payments and returns.",
    body: `## How do I choose the right size?
Our sizes follow your child's age. Every product page has a size guide with measurements. If your little one is between sizes, we recommend sizing up.

## Which payment methods do you accept?
Cash on delivery is available nationwide. Other methods available at checkout are shown there.

## How long does delivery take?
{{estimate}}.

## How much is delivery?
{{flatRate}} per order, and free on orders of {{freeThreshold}} or more.

## Can I return or exchange an item?
Yes — within {{returnDays}} days of delivery for unworn items with tags. See [Returns & Exchanges](/pages/returns).

## How can I track my order?
Use the [Track Order](/track-order) page with your order number and phone number.`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    seoDescription: "Get in touch with Kinder Thread.",
    body: `We're happy to help with sizing questions, orders and anything else.

{{contactBlock}}

We usually reply within one working day.`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    seoDescription: "How Kinder Thread collects and uses your information.",
    body: `This policy explains what information we collect and how we use it.

## What we collect
- Details you give us when ordering: name, phone number, email, delivery address.
- Account details if you create an account.
- Your email address if you subscribe to our newsletter.

## How we use it
- To process, deliver and support your orders.
- To send newsletters if you subscribed (you can unsubscribe anytime).

## What we don't do
We do not sell your personal information. We only share delivery details with our courier partners to deliver your order.

## Your choices
You can ask us to update or delete your information at any time by contacting us.

> Please have this policy reviewed before launch.`,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    seoDescription: "Terms of use for the Kinder Thread online store.",
    body: `By using this website and placing an order you agree to these terms.

## Orders
All orders are subject to availability and confirmation. We may contact you by phone to confirm cash on delivery orders.

## Prices
Prices are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise.

## Product images
We try to show colours as accurately as possible; screens can vary slightly.

> Please have these terms reviewed before launch.`,
  },
  {
    slug: "about",
    title: "Our Story",
    showInFooter: false,
    seoDescription: "Kinder Thread — thoughtfully selected clothing for little ones aged 0–5.",
    body: `Every little outfit is part of a bigger story.

Kinder Thread began with a simple idea: dressing little ones should feel joyful, not complicated. We look for pieces that are soft, practical and quietly beautiful — the kind of clothes that are reached for again and again.

## What we care about
- **Thoughtful selection.** Each style is chosen for its colour, cut and everyday practicality.
- **Simple sizing.** Clear sizes by age, from newborn to five years.
- **Friendly service.** Real people, ready to help on WhatsApp and email.

Our first collection is being prepared now. Thank you for being part of our little world.`,
  },
];

const SIZE_ROWS = [
  { size: "0-3M", age: "0–3 months", height: "56–62", chest: "41", waist: "41", length: "35" },
  { size: "3-6M", age: "3–6 months", height: "62–68", chest: "43", waist: "43", length: "37" },
  { size: "6-9M", age: "6–9 months", height: "68–74", chest: "45", waist: "45", length: "39" },
  { size: "9-12M", age: "9–12 months", height: "74–80", chest: "47", waist: "46", length: "41" },
  { size: "12-18M", age: "12–18 months", height: "80–86", chest: "49", waist: "47", length: "43" },
  { size: "18-24M", age: "18–24 months", height: "86–92", chest: "51", waist: "48", length: "45" },
  { size: "2-3Y", age: "2–3 years", height: "92–98", chest: "53", waist: "49", length: "47" },
  { size: "3-4Y", age: "3–4 years", height: "98–104", chest: "55", waist: "50", length: "50" },
  { size: "4-5Y", age: "4–5 years", height: "104–110", chest: "57", waist: "51", length: "53" },
];

async function main() {
  // ---------------- admin ----------------
  // ADMIN_EMAIL/ADMIN_PASSWORD create that admin if missing. The documented default
  // admin is only ever created on a database that has no administrator at all.
  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  const explicit = !!process.env.ADMIN_EMAIL;
  if (explicit || adminCount === 0) {
    const email = (process.env.ADMIN_EMAIL || "admin@kinderthread.local").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "ChangeMe-KT-2026!";
    if (explicit && !process.env.ADMIN_PASSWORD) throw new Error("Set ADMIN_PASSWORD together with ADMIN_EMAIL.");
    if (!(await db.user.findUnique({ where: { email } }))) {
      await db.user.create({ data: { email, name: "Store Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`✔ Admin created: ${email}${explicit ? " (password from ADMIN_PASSWORD)" : ` with default password "${password}" — change it after first login`}`);
    }
  }

  // ---------------- size guide ----------------
  let guide = await db.sizeGuide.findFirst({ where: { isDefault: true } });
  if (!guide) {
    guide = await db.sizeGuide.create({
      data: {
        name: "Kinder Thread standard (0–5 years)",
        unit: "cm",
        isDefault: true,
        rows: SIZE_ROWS,
        notes: "Sample measurements — replace with the measurements from your supplier's size chart in Admin → Size guides.",
      },
    });
  }

  // ---------------- refresh old sample content ----------------
  const refresh = process.argv.includes("--refresh-samples");
  if (refresh) {
    const removed = await db.product.deleteMany({ where: { isSample: true } });
    // placeholder imagery lives under /samples (old) or /images (current); admin uploads live under /media
    const placeholder = [{ startsWith: "/samples/" }, { startsWith: "/images/" }];
    const oldBanners = await db.banner.deleteMany({ where: { OR: placeholder.map((p) => ({ image: p })) } });
    const oldGallery = await db.galleryImage.deleteMany({ where: { OR: [{ isSample: true }, ...placeholder.map((p) => ({ url: p }))] } });
    for (const c of SAMPLE_CATEGORIES)
      await db.category.updateMany({ where: { slug: c.slug, OR: [{ image: null }, ...placeholder.map((p) => ({ image: p }))] }, data: { image: c.image, description: c.description } });
    const home = await db.setting.findUnique({ where: { key: "home" } });
    if (home && /\/samples\/|\/images\//.test(JSON.stringify(home.value))) {
      const value = home.value as Record<string, Record<string, unknown>>;
      if (value.story) {
        delete value.story.image;
        delete value.story.image2;
        delete value.story.imageAlt;
        delete value.story.image2Alt;
      }
      await db.setting.update({ where: { key: "home" }, data: { value: value as Prisma.InputJsonObject } });
    }
    console.log(`✔ Removed ${removed.count} old sample products, ${oldBanners.count} banners, ${oldGallery.count} gallery images`);
  }

  // ---------------- categories ----------------
  for (const [i, c] of SAMPLE_CATEGORIES.entries()) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        kind: c.kind,
        description: c.description,
        isFeatured: c.featured,
        sortOrder: i,
        image: c.image,
      },
    });
  }

  // ---------------- products ----------------
  let created = 0;
  for (const [pi, p] of SAMPLE_PRODUCTS.entries()) {
    if (await db.product.findUnique({ where: { slug: p.slug } })) continue;
    const product = await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        fabric: p.fabric,
        care: "Machine wash cold, inside out. Do not bleach. Line dry in shade. Cool iron if needed.",
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        status: "ACTIVE",
        gender: p.gender,
        isSample: true,
        isFeatured: !!p.featured,
        isNewArrival: !!p.newArrival,
        isBestSeller: !!p.bestSeller,
        sortOrder: pi,
        sizeGuideId: guide.id,
        categories: { connect: p.categories.map((slug) => ({ slug })) },
        // stagger createdAt so "newest" sorting is meaningful
        createdAt: new Date(Date.now() - (SAMPLE_PRODUCTS.length - pi) * 36e5 * 7),
      },
    });
    let sort = 0;
    for (const [ci, col] of p.colors.entries()) {
      const color = await db.productColor.create({
        data: { productId: product.id, name: col.name, hex: col.hex, sortOrder: ci },
      });
      for (const url of col.images) {
        await db.productImage.create({
          data: { productId: product.id, colorId: color.id, url, alt: `${p.name} in ${col.name}`, sortOrder: sort++ },
        });
      }
      const colorCode = col.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
      for (const size of p.sizes) {
        const r = rand();
        const stock = r < 0.08 ? 0 : r < 0.18 ? 2 : Math.floor(4 + rand() * 18);
        await db.productVariant.create({
          data: { productId: product.id, colorId: color.id, size, stock, sku: `KT-${p.code}-${colorCode}-${size}` },
        });
      }
    }
    created++;
  }
  if (created) console.log(`✔ ${created} sample products created`);

  // ---------------- pages ----------------
  for (const page of PAGES) {
    await db.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, showInFooter: page.showInFooter ?? true },
    });
  }

  // ---------------- banners & gallery ----------------
  if ((await db.banner.count()) === 0) {
    await db.banner.createMany({ data: SAMPLE_BANNERS.map((b, i) => ({ ...b, sortOrder: i })) });
  }
  if ((await db.galleryImage.count()) === 0) {
    await db.galleryImage.createMany({ data: SAMPLE_GALLERY.map((g, i) => ({ ...g, isSample: true, sortOrder: i })) });
  }

  // ---------------- coupons ----------------
  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENT", value: 10, description: "10% off your first order", minSubtotal: 1500 },
  });
  await db.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: { code: "FREESHIP", type: "FREE_SHIPPING", value: 0, description: "Free delivery", minSubtotal: 2000 },
  });

  // ---------------- settings ----------------
  if (process.env.SEED_PRELAUNCH === "true") {
    const row = await db.setting.findUnique({ where: { key: "prelaunch" } });
    if (!row) await db.setting.create({ data: { key: "prelaunch", value: { enabled: true } } });
  }

  console.log("✔ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
