import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { z } from "zod";
import { hashPassword } from "../lib/password.js";
import { Category } from "../modules/catalog/category.model.js";
import { Product } from "../modules/catalog/product.model.js";
import { SizeGuide } from "../modules/catalog/size-guide.model.js";
import { Banner, GalleryImage, Page } from "../modules/content/content.models.js";
import { Coupon } from "../modules/coupons/coupon.model.js";
import { User } from "../modules/users/user.model.js";

/**
 * Fills an empty database with the starter catalogue, help pages, banners and coupons,
 * and creates the first admin account (from ADMIN_EMAIL / ADMIN_PASSWORD).
 * Safe to run again: existing records (matched by slug / name / code / email) are left as they are.
 * Run it with `npm run seed` (see run-seed.ts).
 */

type SeedProduct = { slug: string; categories: string[]; sizeGuide: string | null } & Record<string, unknown>;

const readJson = <T>(name: string): T => JSON.parse(readFileSync(new URL(`./data/${name}.json`, import.meta.url), "utf8")) as T;

/** Inserts each record whose key isn't in the collection yet. Returns how many were added. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- works with any collection
async function insertMissing<T extends Record<string, unknown>>(model: mongoose.Model<any>, records: T[], key: keyof T & string) {
  let added = 0;
  for (const record of records) {
    const result = await model.updateOne({ [key]: record[key] }, { $setOnInsert: record }, { upsert: true });
    added += result.upsertedCount;
  }
  return added;
}

async function seedCatalog() {
  const categories = await insertMissing(Category, readJson<Record<string, unknown>[]>("categories"), "slug");
  const guides = await insertMissing(SizeGuide, readJson<Record<string, unknown>[]>("size-guides"), "name");

  const categoryIds = new Map((await Category.find().select("slug")).map((c) => [c.slug, c._id]));
  const guideIds = new Map((await SizeGuide.find().select("name")).map((g) => [g.name, g._id]));
  const products = readJson<SeedProduct[]>("products").map((p) => ({
    ...p,
    categories: p.categories.map((slug) => categoryIds.get(slug)).filter(Boolean),
    sizeGuide: p.sizeGuide ? (guideIds.get(p.sizeGuide) ?? null) : null,
  }));
  const added = await insertMissing(Product, products, "slug");
  console.log(`✓ catalogue: ${categories} categories, ${guides} size guides, ${added} products added`);
}

async function seedContent() {
  const pages = await insertMissing(Page, readJson<Record<string, unknown>[]>("pages"), "slug");
  const banners = (await Banner.countDocuments()) === 0 ? (await Banner.insertMany(readJson("banners"))).length : 0;
  const gallery = (await GalleryImage.countDocuments()) === 0 ? (await GalleryImage.insertMany(readJson("gallery"))).length : 0;
  const coupons = await insertMissing(Coupon, readJson<Record<string, unknown>[]>("coupons"), "code");
  console.log(`✓ content: ${pages} pages, ${banners} banners, ${gallery} gallery photos, ${coupons} coupons added`);
}

const adminEnv = z.object({
  ADMIN_NAME: z.string().trim().min(2).default("Store Admin"),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(10, "must be at least 10 characters"),
});

async function seedAdmin() {
  const parsed = adminEnv.safeParse(process.env);
  if (!parsed.success) {
    console.log("• admin: skipped — set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) in .env to create one");
    return;
  }
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;
  const email = ADMIN_EMAIL.toLowerCase();
  if (await User.exists({ email })) {
    console.log(`• admin: ${email} already exists — left unchanged`);
    return;
  }
  await User.create({ name: ADMIN_NAME, email, role: "ADMIN", passwordHash: await hashPassword(ADMIN_PASSWORD) });
  console.log(`✓ admin: created ${email}`);
}

export async function seedDatabase() {
  await mongoose.connection.syncIndexes();
  await seedCatalog();
  await seedContent();
  await seedAdmin();
}
