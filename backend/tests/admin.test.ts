import { describe, expect, it } from "vitest";
import { Product } from "../src/modules/catalog/product.model.js";
import { api, checkoutBody, createCatalog, createUser } from "./helpers.js";

const newProduct = {
  name: "Knit Cardigan",
  description: "A cosy knit cardigan for chilly mornings.",
  price: 3490,
  status: "ACTIVE",
  gender: "UNISEX",
  colors: [{ name: "Rose", hex: "#C98B8B" }],
  images: [{ url: "/images/cardigan.webp", alt: "Cardigan", color: "Rose" }],
  variants: [{ sku: "KT-NYC-ROS-2-3Y", size: "2-3Y", color: "Rose", stock: 4 }],
};

describe("admin access", () => {
  it("is closed to guests and customers", async () => {
    expect((await api().get("/api/admin/dashboard")).status).toBe(401);
    const customer = await createUser("CUSTOMER");
    expect((await api().get("/api/admin/dashboard").set(customer.auth)).status).toBe(403);
    const staff = await createUser("STAFF");
    expect((await api().get("/api/admin/dashboard").set(staff.auth)).status).toBe(200);
    // managing staff is for admins only
    expect((await api().get("/api/admin/staff").set(staff.auth)).status).toBe(403);
  });
});

describe("admin catalogue", () => {
  it("creates a product with a generated slug and validates the form", async () => {
    const { auth } = await createUser("STAFF");
    const created = await api().post("/api/admin/products").set(auth).send(newProduct);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ slug: "knit-cardigan", status: "ACTIVE" });

    const duplicateSku = await api().post("/api/admin/products").set(auth).send({ ...newProduct, name: "Another Cardigan" });
    expect(duplicateSku.status).toBe(409);

    const invalid = await api()
      .post("/api/admin/products")
      .set(auth)
      .send({ ...newProduct, name: "Bad", compareAtPrice: 100, variants: [{ sku: "X1", size: "2-3Y", color: "Blue", stock: -1 }] });
    expect(invalid.status).toBe(400);
    expect(Object.keys(invalid.body.errors)).toEqual(expect.arrayContaining(["compareAtPrice", "variants.0.stock", "variants.0.color"]));
  });

  it("keeps variant ids when a product is edited and updates stock in bulk", async () => {
    const { dress } = await createCatalog();
    const { auth } = await createUser("ADMIN");
    const current = (await api().get(`/api/admin/products/${dress.id}`).set(auth)).body;

    const edited = await api()
      .put(`/api/admin/products/${dress.id}`)
      .set(auth)
      .send({ ...current, name: "Tulle Party Dress (new)", categories: current.categories, sizeGuide: null });
    expect(edited.status).toBe(200);
    expect(edited.body.variants.map((v: { id: string }) => v.id)).toEqual(current.variants.map((v: { id: string }) => v.id));

    const stock = await api()
      .patch("/api/admin/products/stock")
      .set(auth)
      .send({ updates: [{ variantId: current.variants[0].id, stock: 42 }] });
    expect(stock.body.updated).toBe(1);
    expect((await Product.findById(dress._id))!.variants[0].stock).toBe(42);
  });

  it("never undoes a sale when an older product form is saved", async () => {
    const { shirt } = await createCatalog();
    const { auth } = await createUser("STAFF");
    const form = (await api().get(`/api/admin/products/${shirt.id}`).set(auth)).body; // stock 10
    await api().post("/api/orders").send(checkoutBody(form.variants[0].id, 3)); // a sale meanwhile → 7

    const saved = await api().put(`/api/admin/products/${shirt.id}`).set(auth).send({ ...form, description: "Updated description text." });
    expect(saved.status).toBe(200);
    expect(saved.body.variants[0].stock).toBe(7);
  });

  it("protects the automatic collection slugs", async () => {
    const { auth } = await createUser("STAFF");
    const res = await api().post("/api/admin/categories").set(auth).send({ name: "Sale", slug: "sale" });
    expect(res.status).toBe(400);
  });
});

describe("admin orders", () => {
  it("moves an order along and puts stock back when it is cancelled", async () => {
    const { shirt } = await createCatalog();
    const { auth } = await createUser("STAFF");
    const variantId = String(shirt.variants[0]._id);
    const placed = await api().post("/api/orders").send(checkoutBody(variantId, 3));
    const id = placed.body.id;

    const confirmed = await api().patch(`/api/admin/orders/${id}/status`).set(auth).send({ status: "CONFIRMED" });
    expect(confirmed.body.status).toBe("CONFIRMED");
    expect((await api().patch(`/api/admin/orders/${id}/status`).set(auth).send({ status: "CONFIRMED" })).status).toBe(409);

    const shipped = await api().patch(`/api/admin/orders/${id}/shipping`).set(auth).send({ courier: "TCS", trackingNumber: "123", markShipped: true });
    expect(shipped.body.status).toBe("SHIPPED");

    const cancelled = await api().post(`/api/admin/orders/${id}/cancel`).set(auth).send({ reason: "Customer asked" });
    expect(cancelled.body.status).toBe("CANCELLED");
    expect((await Product.findById(shirt._id))!.variants[0].stock).toBe(10);
    expect((await api().patch(`/api/admin/orders/${id}/status`).set(auth).send({ status: "DELIVERED" })).status).toBe(409);

    const list = await api().get("/api/admin/orders?status=CANCELLED").set(auth);
    expect(list.body.total).toBe(1);
  });

  it("only moves orders forward and rejects unsafe tracking links", async () => {
    const { shirt } = await createCatalog();
    const { auth } = await createUser("STAFF");
    const placed = await api().post("/api/orders").send(checkoutBody(String(shirt.variants[0]._id)));
    const id = placed.body.id;
    expect((await api().patch(`/api/admin/orders/${id}/status`).set(auth).send({ status: "SHIPPED" })).status).toBe(200);
    expect((await api().patch(`/api/admin/orders/${id}/status`).set(auth).send({ status: "PENDING" })).status).toBe(409);
    const link = await api().patch(`/api/admin/orders/${id}/shipping`).set(auth).send({ courier: "TCS", trackingUrl: "javascript:alert(1)" });
    expect(link.status).toBe(400);
  });

  it("puts stock back only once when cancel is clicked twice", async () => {
    const { shirt } = await createCatalog();
    const { auth } = await createUser("STAFF");
    const placed = await api().post("/api/orders").send(checkoutBody(String(shirt.variants[0]._id), 2)); // 10 → 8

    const results = await Promise.all([
      api().post(`/api/admin/orders/${placed.body.id}/cancel`).set(auth).send({}),
      api().post(`/api/admin/orders/${placed.body.id}/cancel`).set(auth).send({}),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect((await Product.findById(shirt._id))!.variants[0].stock).toBe(10);
  });
});

describe("settings & staff", () => {
  it("validates settings and uses them for prices straight away", async () => {
    const { dress } = await createCatalog();
    const { auth } = await createUser("ADMIN");
    expect((await api().put("/api/admin/settings/shipping").set(auth).send({ flatRate: -5 })).status).toBe(400);
    expect((await api().put("/api/admin/settings/nope").set(auth).send({})).status).toBe(400);
    expect((await api().put("/api/admin/settings/constructor").set(auth).send({})).status).toBe(400);

    const saved = await api().put("/api/admin/settings/shipping").set(auth).send({ flatRate: 300, freeThreshold: 10000 });
    expect(saved.body).toMatchObject({ flatRate: 300, freeThreshold: 10000 });
    const quote = await api()
      .post("/api/cart/quote")
      .send({ lines: [{ variantId: String(dress.variants[0]._id), quantity: 1 }] });
    expect(quote.body.shippingFee).toBe(300);
  });

  it("lets only admins change payment details", async () => {
    const staff = await createUser("STAFF");
    const admin = await createUser("ADMIN");
    const payments = { cod: { enabled: true }, bank: { enabled: true, accountNumber: "0123" } };
    expect((await api().put("/api/admin/settings/payments").set(staff.auth).send(payments)).status).toBe(403);
    expect((await api().put("/api/admin/settings/payments").set(admin.auth).send(payments)).status).toBe(200);
  });

  it("reads coupon dates as whole days in Pakistan time", async () => {
    const { auth } = await createUser("STAFF");
    const res = await api().post("/api/admin/coupons").set(auth).send({ code: "EID", type: "FIXED", value: 300, startsAt: "2026-12-01", endsAt: "2026-12-31" });
    expect(res.status).toBe(201);
    expect(res.body.startsAt).toBe("2026-11-30T19:00:00.000Z");
    expect(res.body.endsAt).toBe("2026-12-31T18:59:59.999Z");
  });

  it("keeps at least one admin and stops admins changing themselves", async () => {
    const admin = await createUser("ADMIN");
    const created = await api().post("/api/admin/staff").set(admin.auth).send({ name: "Helper", email: "helper@example.com", role: "STAFF", password: "long-enough-pass" });
    expect(created.status).toBe(201);
    expect((await api().patch(`/api/admin/staff/${admin.user.id}/active`).set(admin.auth).send({ isActive: false })).status).toBe(409);
    expect((await api().patch(`/api/admin/staff/${created.body.id}/role`).set(admin.auth).send({ role: "ADMIN" })).body.role).toBe("ADMIN");
  });
});
