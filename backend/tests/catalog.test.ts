import { describe, expect, it } from "vitest";
import { api, createCatalog } from "./helpers.js";

describe("health & routing", () => {
  it("reports the database connection", async () => {
    const res = await api().get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", database: "connected" });
  });

  it("answers unknown routes with a JSON 404", async () => {
    const res = await api().get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Route not found");
  });

  it("rejects broken JSON bodies", async () => {
    const res = await api().post("/api/cart/quote").set("Content-Type", "application/json").send("{oops");
    expect(res.status).toBe(400);
  });
});

describe("catalogue", () => {
  it("lists only active products, as cards with an id instead of _id", async () => {
    await createCatalog();
    const res = await api().get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    const card = res.body.items[0];
    expect(card.id).toBeTypeOf("string");
    expect(card._id).toBeUndefined();
    expect(res.body.items.map((p: { slug: string }) => p.slug)).not.toContain("draft-romper");
  });

  it("filters by category, age group, sale and sorts by price", async () => {
    await createCatalog();
    expect((await api().get("/api/products?category=baby-girls")).body.items.map((p: { slug: string }) => p.slug)).toEqual(["tulle-party-dress"]);
    expect((await api().get("/api/products?age=toddler")).body.items.map((p: { slug: string }) => p.slug)).toEqual(["linen-shirt"]);
    expect((await api().get("/api/products?category=sale")).body.total).toBe(1);
    expect((await api().get("/api/products?sort=price-asc")).body.items[0].slug).toBe("linen-shirt");
    expect((await api().get("/api/products?category=unknown")).body.total).toBe(0);
    expect((await api().get("/api/products?q=linen")).body.total).toBe(1);
  });

  it("validates query parameters", async () => {
    const res = await api().get("/api/products?sort=cheapest");
    expect(res.status).toBe(400);
    expect(res.body.errors.sort).toBeDefined();
  });

  it("returns a product page with its size guide and related products", async () => {
    await createCatalog();
    const res = await api().get("/api/products/tulle-party-dress");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Tulle Party Dress");
    expect(res.body.sizeGuide.name).toBe("Standard");
    expect(res.body.categories[0]).toMatchObject({ name: "Baby Girls", slug: "baby-girls" });
    expect((await api().get("/api/products/draft-romper")).status).toBe(404);
  });

  it("returns facets and virtual collections", async () => {
    await createCatalog();
    const facets = await api().get("/api/products/facets?category=baby-girls");
    expect(facets.body.sizes).toEqual(["2-3Y", "3-4Y"]);
    expect(facets.body.colors).toEqual([{ name: "Mint", hex: "#BFD8C8" }]);
    const collection = await api().get("/api/categories/new-arrivals");
    expect(collection.body).toMatchObject({ name: "New Arrivals", isVirtual: true });
  });

  it("serves settings with defaults on an empty database", async () => {
    const res = await api().get("/api/settings");
    expect(res.status).toBe(200);
    expect(res.body.shipping).toMatchObject({ flatRate: 250, freeThreshold: 4000 });
    expect(res.body.payments.cod.enabled).toBe(true);
  });
});
