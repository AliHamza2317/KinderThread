import request from "supertest";
import app from "../src/app.js";
import { connectDb } from "../src/db/connect.js";
import { hashPassword } from "../src/lib/password.js";
import { issueToken } from "../src/modules/auth/auth.service.js";
import { Category } from "../src/modules/catalog/category.model.js";
import { Product } from "../src/modules/catalog/product.model.js";
import { SizeGuide } from "../src/modules/catalog/size-guide.model.js";
import { Coupon } from "../src/modules/coupons/coupon.model.js";
import { User, type Role } from "../src/modules/users/user.model.js";

export const api = () => request(app);

/** Creates a user and returns it with a valid Bearer header. */
export async function createUser(role: Role = "CUSTOMER", overrides: { email?: string; password?: string } = {}) {
  await connectDb();
  const password = overrides.password ?? "correct-horse-battery";
  const user = await User.create({
    name: `${role.toLowerCase()} user`,
    email: overrides.email ?? `${role.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    role,
    passwordHash: await hashPassword(password),
  });
  return { user, password, auth: { Authorization: `Bearer ${issueToken(user)}` } };
}

/** A small catalogue: one size guide, two categories and three products. */
export async function createCatalog() {
  await connectDb();
  const guide = await SizeGuide.create({ name: "Standard", isDefault: true, rows: [{ size: "2-3Y", height: "92–98" }] });
  const girls = await Category.create({ name: "Baby Girls", slug: "baby-girls" });
  const boys = await Category.create({ name: "Baby Boys", slug: "baby-boys" });

  const dress = await Product.create({
    name: "Tulle Party Dress",
    slug: "tulle-party-dress",
    description: "A soft tulle dress for parties.",
    price: 3790,
    compareAtPrice: 4290,
    status: "ACTIVE",
    gender: "GIRL",
    isNewArrival: true,
    categories: [girls._id],
    colors: [{ name: "Mint", hex: "#BFD8C8" }],
    images: [{ url: "/images/dress.webp", alt: "Dress", color: "Mint" }],
    variants: [
      { sku: "KT-TPD-MIN-2-3Y", size: "2-3Y", color: "Mint", stock: 5 },
      { sku: "KT-TPD-MIN-3-4Y", size: "3-4Y", color: "Mint", stock: 1 },
    ],
  });
  const shirt = await Product.create({
    name: "Linen Shirt",
    slug: "linen-shirt",
    description: "A relaxed linen shirt for little boys.",
    price: 2490,
    status: "ACTIVE",
    gender: "BOY",
    isFeatured: true,
    categories: [boys._id],
    colors: [{ name: "Stone", hex: "#B5AFA5" }],
    variants: [{ sku: "KT-LGS-STO-12-18M", size: "12-18M", color: "Stone", stock: 10 }],
  });
  const draft = await Product.create({
    name: "Draft Romper",
    slug: "draft-romper",
    description: "Not on sale yet, should stay hidden.",
    price: 1990,
    status: "DRAFT",
    variants: [{ sku: "KT-DRF-1", size: "0-3M", stock: 3 }],
  });
  return { guide, girls, boys, dress, shirt, draft };
}

export async function createCoupon(data: Record<string, unknown>) {
  await connectDb();
  return Coupon.create(data);
}

/** A valid checkout body for the given variant. */
export const checkoutBody = (variantId: string, quantity = 1, extra: Record<string, unknown> = {}) => ({
  name: "Ayesha Khan",
  phone: "0300 1234567",
  email: "ayesha@example.com",
  city: "Lahore",
  address: "House 12, Street 4, Model Town",
  paymentMethod: "cod",
  lines: [{ variantId, quantity }],
  ...extra,
});
