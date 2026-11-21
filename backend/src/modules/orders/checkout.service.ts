import { randomInt } from "node:crypto";
import mongoose from "mongoose";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { quoteCart, type CartQuote } from "../cart/pricing.service.js";
import { getSettings } from "../content/settings.service.js";
import { useCoupon } from "../coupons/coupon.service.js";
import { Order, type OrderDocument, type PaymentStatus } from "./order.model.js";
import type { CheckoutInput } from "./order.validation.js";
import { takeStock, type StockItem } from "./stock.service.js";

/** e.g. KT2611-48213 (year + month, then a random number). */
function newOrderNumber(now = new Date()): string {
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `KT${yymm}-${randomInt(10000, 100000)}`;
}

const isDuplicateNumber = (error: unknown) =>
  (error as { code?: number })?.code === 11000 && "number" in ((error as { keyValue?: object }).keyValue ?? {});

/** Lists what can't be bought as asked, e.g. "Linen Shirt (2-3Y): Only 1 left". */
function describeIssues(quote: CartQuote): string | null {
  const problems = quote.lines.filter((line) => line.issue).map((line) => `${line.name} (${line.size}): ${line.issue}`);
  if (quote.unavailable.length) problems.push(`${quote.unavailable.length} item(s) are no longer sold`);
  return problems.length ? `Some items in your bag have changed — ${problems.join("; ")}. Please review your bag.` : null;
}

/**
 * Places an order:
 *   1. check the payment method and price the bag on the server (the browser's prices are never used)
 *   2. in one MongoDB transaction: take the stock, count the coupon use and save the order —
 *      if any step fails, none of them happen
 */
export async function placeOrder(input: CheckoutInput, userId: string | null): Promise<OrderDocument> {
  const settings = await getSettings({ fresh: true }); // a payment method switched off a moment ago must not be accepted

  const method = settings.payments[input.paymentMethod];
  if (!method.enabled) throw badRequest("This payment method isn't available right now.", { paymentMethod: ["Choose another payment method."] });
  if (input.paymentMethod !== "cod" && !input.paymentReference) {
    throw badRequest("Please enter your transaction reference.", { paymentReference: ["Enter the transaction ID / reference from your transfer."] });
  }

  const quote = await quoteCart(input.lines, { couponCode: input.couponCode ?? undefined, paymentMethod: input.paymentMethod });
  if (input.couponCode && quote.couponError) throw badRequest(quote.couponError, { couponCode: [quote.couponError] });
  const issues = describeIssues(quote);
  if (issues) throw conflict(issues);
  if (quote.itemCount === 0) throw badRequest("Your bag is empty.");

  const stockItems: StockItem[] = quote.lines.map((line) => ({ productId: line.productId, variantId: line.variantId, quantity: line.quantity }));
  const couponCode = quote.coupon?.code ?? null;

  const order = {
    user: userId,
    customerName: input.name,
    email: input.email,
    phone: input.phone,
    city: input.city,
    address: input.address,
    postalCode: input.postalCode,
    notes: input.notes,
    paymentMethod: input.paymentMethod,
    paymentStatus: (input.paymentMethod === "cod" ? "UNPAID" : "PENDING_VERIFICATION") as PaymentStatus,
    paymentReference: input.paymentReference,
    subtotal: quote.subtotal,
    discount: quote.discount,
    shippingFee: quote.shippingFee,
    paymentFee: quote.paymentFee,
    total: quote.total,
    couponCode,
    items: quote.lines.map((line) => ({
      product: line.productId,
      variant: line.variantId,
      name: line.name,
      sku: line.sku,
      size: line.size,
      color: line.color,
      image: line.image,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    })),
    events: [{ status: "PENDING" as const, message: "Order placed", isPublic: true, actor: "customer" }],
  };

  // the random order number can (rarely) be taken already: then try again with a new one
  for (let attempt = 1; ; attempt++) {
    try {
      return await mongoose.connection.transaction(async (session) => {
        await takeStock(stockItems, session);
        if (couponCode) await useCoupon(couponCode, session);
        const [created] = await Order.create([{ ...order, number: newOrderNumber() }], { session });
        return created;
      });
    } catch (error) {
      if (!isDuplicateNumber(error) || attempt >= 5) throw error;
    }
  }
}

/** Order tracking for guests: the order number plus the phone number used at checkout. */
export async function findOrderForTracking(number: string, phone: string): Promise<OrderDocument> {
  const order = await Order.findOne({ number, phone });
  if (!order) throw notFound("We couldn't find an order with that number and phone number.");
  return order;
}
