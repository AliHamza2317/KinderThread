"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fieldErrors, type ActionResult } from "@/lib/action-result";
import { grantOrderAccess } from "@/lib/order-access";
import { CheckoutError, placeOrder } from "@/lib/orders";
import { PK_PHONE_RE } from "@/lib/pk-cities";
import { rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { normalizePhone } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => PK_PHONE_RE.test(v), "Enter a mobile number like 03XX XXXXXXX."),
  email: z.email("Enter a valid email address.").max(160),
  city: z.string().trim().min(2, "Please enter your city.").max(60),
  address: z.string().trim().min(8, "Please enter your complete address (house, street, area).").max(300),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["cod", "bank", "jazzcash", "easypaisa"], { message: "Choose a payment method." }),
  paymentReference: z.string().trim().max(60).optional().or(z.literal("")),
  coupon: z.string().trim().max(40).optional().or(z.literal("")),
  lines: z.string().max(10_000),
  newsletter: z.string().optional(),
});

export async function placeOrderAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const limited = await rateLimit("checkout", 10, 10 * 60_000);
  if (!limited.ok) return { ok: false, message: "Too many attempts — please wait a few minutes and try again." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  const d = parsed.data;

  const settings = await getSettings();
  const method = settings.payments[d.paymentMethod];
  if (!method?.enabled) return { ok: false, message: "That payment method isn't available right now.", errors: { paymentMethod: ["Choose another payment method."] } };
  const manual = d.paymentMethod !== "cod";
  if (manual && !d.paymentReference) return { ok: false, message: "Please enter your transaction reference.", errors: { paymentReference: ["Enter the transaction ID / reference from your transfer."] } };

  let lines: { variantId: string; quantity: number }[];
  try {
    lines = z.array(z.object({ variantId: z.string().max(40), quantity: z.number().int().min(1).max(10) })).min(1).max(60).parse(JSON.parse(d.lines));
  } catch {
    return { ok: false, message: "Your bag is empty or out of date. Please review it and try again." };
  }

  const user = await getCurrentUser();
  let order;
  try {
    order = await placeOrder({
      lines,
      couponCode: d.coupon || null,
      paymentMethod: d.paymentMethod,
      paymentReference: d.paymentReference || null,
      userId: user?.id ?? null,
      customer: {
        name: d.name,
        email: d.email,
        phone: normalizePhone(d.phone),
        city: d.city,
        address: d.address,
        postalCode: d.postalCode || null,
        notes: d.notes || null,
      },
    });
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, message: e.message };
    console.error("[checkout]", e);
    return { ok: false, message: "Something went wrong while placing your order. Please try again." };
  }

  if (d.newsletter === "on") {
    await db.subscriber
      .upsert({ where: { email_source: { email: d.email.toLowerCase(), source: "CHECKOUT" } }, create: { email: d.email.toLowerCase(), source: "CHECKOUT" }, update: { isActive: true } })
      .catch(() => null);
  }
  await grantOrderAccess(order.number);
  redirect(`/checkout/success/${order.number}?placed=1`);
}
