import { describe, expect, it } from "vitest";
import { Order } from "../src/modules/orders/order.model.js";
import { api, checkoutBody, createCatalog, createUser } from "./helpers.js";

describe("sign up & sign in", () => {
  it("registers, signs in and reads the current user", async () => {
    const register = await api().post("/api/auth/register").send({ name: "Sara", email: "Sara@Example.com", password: "a-good-password" });
    expect(register.status).toBe(201);
    expect(register.body.user).toMatchObject({ name: "Sara", email: "sara@example.com", role: "CUSTOMER" });
    expect(register.body.user.passwordHash).toBeUndefined();

    const login = await api().post("/api/auth/login").send({ email: "sara@example.com", password: "a-good-password" });
    expect(login.status).toBe(200);

    const me = await api().get("/api/auth/me").set("Authorization", `Bearer ${login.body.token}`);
    expect(me.body.email).toBe("sara@example.com");
  });

  it("rejects duplicate emails, wrong passwords and bad tokens", async () => {
    await createUser("CUSTOMER", { email: "taken@example.com" });
    expect((await api().post("/api/auth/register").send({ name: "X", email: "taken@example.com", password: "12345678" })).status).toBe(400); // name too short
    expect((await api().post("/api/auth/register").send({ name: "Xena", email: "taken@example.com", password: "12345678" })).status).toBe(409);
    expect((await api().post("/api/auth/login").send({ email: "taken@example.com", password: "wrong-password" })).status).toBe(401);
    expect((await api().get("/api/auth/me").set("Authorization", "Bearer not-a-token")).status).toBe(401);
    expect((await api().get("/api/account/orders")).status).toBe(401);
  });

  it("signs out every device", async () => {
    const { auth } = await createUser();
    expect((await api().post("/api/auth/logout-all").set(auth)).status).toBe(204);
    expect((await api().get("/api/auth/me").set(auth)).status).toBe(401);
  });

  it("changes the password and returns a fresh token", async () => {
    const { auth, password, user } = await createUser();
    const res = await api().post("/api/account/password").set(auth).send({ current: password, password: "a-brand-new-password" });
    expect(res.status).toBe(200);
    expect((await api().get("/api/auth/me").set(auth)).status).toBe(401); // old token
    expect((await api().get("/api/auth/me").set("Authorization", `Bearer ${res.body.token}`)).status).toBe(200);
    expect((await api().post("/api/auth/login").send({ email: user.email, password: "a-brand-new-password" })).status).toBe(200);
  });
});

describe("addresses & wishlist", () => {
  it("keeps exactly one default address", async () => {
    const { auth } = await createUser();
    const address = { fullName: "Sara Ahmed", phone: "03001234567", city: "Karachi", line1: "Flat 4, Block 2, Clifton" };
    const first = await api().post("/api/account/addresses").set(auth).send(address);
    expect(first.status).toBe(201);
    expect(first.body[0].isDefault).toBe(true);

    const second = await api().post("/api/account/addresses").set(auth).send({ ...address, city: "Lahore", isDefault: true });
    expect(second.body.map((a: { isDefault: boolean }) => a.isDefault)).toEqual([false, true]);

    const afterDelete = await api().delete(`/api/account/addresses/${second.body[1].id}`).set(auth);
    expect(afterDelete.body).toHaveLength(1);
    expect(afterDelete.body[0].isDefault).toBe(true);

    const invalid = await api().post("/api/account/addresses").set(auth).send({ ...address, postalCode: "12" });
    expect(invalid.status).toBe(400);
  });

  it("saves a wishlist across devices", async () => {
    const { dress } = await createCatalog();
    const { auth } = await createUser();
    const res = await api().post(`/api/account/wishlist/${dress.id}`).set(auth);
    expect(res.body.map((p: { slug: string }) => p.slug)).toEqual(["tulle-party-dress"]);
    expect((await api().get("/api/account/wishlist").set(auth)).body).toHaveLength(1);
  });
});

describe("my orders & returns", () => {
  it("links checkout to the account and allows one return after delivery", async () => {
    const { shirt } = await createCatalog();
    const { auth, user } = await createUser();
    const variantId = String(shirt.variants[0]._id);

    const placed = await api().post("/api/orders").set(auth).send(checkoutBody(variantId));
    const number = placed.body.number;
    expect((await api().get("/api/account/orders").set(auth)).body.items).toHaveLength(1);

    const early = await api().post(`/api/account/orders/${number}/returns`).set(auth).send({ type: "EXCHANGE", reason: "Size doesn't fit" });
    expect(early.status).toBe(409);

    await Order.updateOne({ number }, { $set: { status: "DELIVERED" }, $push: { events: { status: "DELIVERED", message: "Delivered", createdAt: new Date() } } });

    const detail = await api().get(`/api/account/orders/${number}`).set(auth);
    expect(detail.body.returnEligibility.eligible).toBe(true);

    const request = await api().post(`/api/account/orders/${number}/returns`).set(auth).send({ type: "EXCHANGE", reason: "Size doesn't fit", details: "Need 18-24M" });
    expect(request.status).toBe(201);
    expect(request.body).toMatchObject({ status: "REQUESTED", type: "EXCHANGE" });
    expect(user.id).toBeTypeOf("string");

    expect(request.body.user).toBeUndefined();

    const again = await api().post(`/api/account/orders/${number}/returns`).set(auth).send({ type: "RETURN", reason: "Changed my mind" });
    expect(again.status).toBe(409);

    // staff notes on the request stay private
    const staff = await createUser("STAFF");
    await api().patch(`/api/admin/returns/${request.body.id}`).set(staff.auth).send({ status: "APPROVED", adminNote: "internal remark" });
    const mine = await api().get(`/api/account/orders/${number}`).set(auth);
    expect(mine.body.returns[0]).toMatchObject({ status: "APPROVED" });
    expect(mine.body.returns[0].adminNote).toBeUndefined();

    const someoneElse = await createUser();
    expect((await api().get(`/api/account/orders/${number}`).set(someoneElse.auth)).status).toBe(404);
  });
});
