import { describe, expect, it, vi } from "vitest";
import { connectDb } from "../src/db/connect.js";
import { Category } from "../src/modules/catalog/category.model.js";
import { Product } from "../src/modules/catalog/product.model.js";
import { Page } from "../src/modules/content/content.models.js";
import { User } from "../src/modules/users/user.model.js";
import { seedDatabase } from "../src/seed/seed.js";
import { api } from "./helpers.js";

describe("seed", () => {
  it("loads the starter data once and creates the first admin", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.ADMIN_EMAIL = "owner@example.com";
    process.env.ADMIN_PASSWORD = "a-long-admin-password";
    await connectDb();

    await seedDatabase();
    await seedDatabase(); // running it again adds nothing

    expect(await Product.countDocuments()).toBe(14);
    expect(await Category.countDocuments()).toBe(7);
    expect(await Page.countDocuments()).toBe(7);
    expect(await User.countDocuments({ role: "ADMIN" })).toBe(1);

    // the seeded catalogue works through the API
    const shop = await api().get("/api/products?category=baby-girls");
    expect(shop.body.total).toBeGreaterThan(0);
    const login = await api().post("/api/auth/login").send({ email: "owner@example.com", password: "a-long-admin-password" });
    expect(login.body.user.role).toBe("ADMIN");
  });
});
