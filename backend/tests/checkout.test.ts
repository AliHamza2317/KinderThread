import { describe, expect, it } from "vitest";
import { Coupon } from "../src/modules/coupons/coupon.model.js";
import { Product } from "../src/modules/catalog/product.model.js";
import { api, checkoutBody, createCatalog, createCoupon } from "./helpers.js";

const variantOf = (product: { variants: { _id: unknown; size: string }[] }, size: string) => String(product.variants.find((v) => v.size === size)!._id);

describe("cart quote", () => {
  it("prices the bag on the server with delivery and coupon", async () => {
    const { dress } = await createCatalog();
    await createCoupon({ code: "WELCOME10", type: "PERCENT", value: 10, minSubtotal: 1000 });

    const plain = await api()
      .post("/api/cart/quote")
      .send({ lines: [{ variantId: variantOf(dress, "2-3Y"), quantity: 1 }] });
    expect(plain.body).toMatchObject({ subtotal: 3790, shippingFee: 250, total: 4040, itemCount: 1 });

    const withCoupon = await api()
      .post("/api/cart/quote")
      .send({ lines: [{ variantId: variantOf(dress, "2-3Y"), quantity: 2 }], couponCode: "welcome10" });
    expect(withCoupon.body).toMatchObject({ subtotal: 7580, discount: 758, shippingFee: 0, total: 6822, coupon: { code: "WELCOME10" } });
  });

  it("limits quantities to the stock left", async () => {
    const { dress } = await createCatalog();
    const res = await api()
      .post("/api/cart/quote")
      .send({ lines: [{ variantId: variantOf(dress, "3-4Y"), quantity: 3 }] });
    expect(res.body.lines[0]).toMatchObject({ requested: 3, quantity: 1, issue: "Only 1 left" });
  });
});

describe("checkout", () => {
  it("places an order, takes the stock and counts the coupon use", async () => {
    const { dress } = await createCatalog();
    await createCoupon({ code: "FREESHIP", type: "FREE_SHIPPING", maxUses: 5 });

    const res = await api()
      .post("/api/orders")
      .send(checkoutBody(variantOf(dress, "2-3Y"), 2, { couponCode: "FREESHIP", subtotal: 1, total: 1 }));
    expect(res.status).toBe(201);
    expect(res.body.number).toMatch(/^KT\d{4}-\d{5}$/);
    // the client's "total: 1" is ignored — the server works out the price
    expect(res.body).toMatchObject({ subtotal: 7580, shippingFee: 0, total: 7580, status: "PENDING", paymentStatus: "UNPAID", phone: "03001234567" });
    expect(res.body.internalNote).toBeUndefined();

    const product = await Product.findById(dress._id);
    expect(product!.variants.find((v) => v.size === "2-3Y")!.stock).toBe(3);
    expect(product!.soldCount).toBe(2);
    expect((await Coupon.findOne({ code: "FREESHIP" }))!.usedCount).toBe(1);
  });

  it("refuses to sell more than is in stock and leaves stock untouched", async () => {
    const { dress } = await createCatalog();
    const res = await api().post("/api/orders").send(checkoutBody(variantOf(dress, "3-4Y"), 2));
    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Only 1 left");
    const product = await Product.findById(dress._id);
    expect(product!.variants.find((v) => v.size === "3-4Y")!.stock).toBe(1);
  });

  it("checks the form and the payment method", async () => {
    const { dress } = await createCatalog();
    const invalid = await api().post("/api/orders").send({ ...checkoutBody(variantOf(dress, "2-3Y")), phone: "12345", email: "nope" });
    expect(invalid.status).toBe(400);
    expect(Object.keys(invalid.body.errors)).toEqual(expect.arrayContaining(["phone", "email"]));

    // bank transfer is switched off in the default settings
    const bank = await api()
      .post("/api/orders")
      .send(checkoutBody(variantOf(dress, "2-3Y"), 1, { paymentMethod: "bank", paymentReference: "TX1" }));
    expect(bank.status).toBe(400);
    expect(bank.body.errors.paymentMethod).toBeDefined();
  });

  it("treats an expired sign-in at checkout as a guest order", async () => {
    const { shirt } = await createCatalog();
    const res = await api().post("/api/orders").set("Authorization", "Bearer expired.or.invalid").send(checkoutBody(variantOf(shirt, "12-18M")));
    expect(res.status).toBe(201);
  });

  it("lets guests track an order with the order number and phone", async () => {
    const { shirt } = await createCatalog();
    const order = await api().post("/api/orders").send(checkoutBody(variantOf(shirt, "12-18M")));

    const found = await api().get(`/api/orders/track?number=${order.body.number}&phone=%2B92%20300%201234567`);
    expect(found.status).toBe(200);
    expect(found.body).toMatchObject({ number: order.body.number, status: "PENDING" });
    expect(found.body.address).toBeUndefined();

    const wrongPhone = await api().get(`/api/orders/track?number=${order.body.number}&phone=03111111111`);
    expect(wrongPhone.status).toBe(404);
  });
});
