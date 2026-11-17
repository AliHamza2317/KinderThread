import "server-only";
import { db } from "@/lib/db";
import { quoteCart, type CartLineInput } from "@/lib/pricing";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const ORDER_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export class CheckoutError extends Error {}

async function nextOrderNumber(tx: Prisma.TransactionClient) {
  // KT-YYMM-XXXXX: readable on the phone, not guessable sequentially.
  const d = new Date();
  const prefix = `KT${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  for (let i = 0; i < 6; i++) {
    const n = Math.floor(10000 + Math.random() * 89999);
    const number = `${prefix}-${n}`;
    const exists = await tx.order.findUnique({ where: { number }, select: { id: true } });
    if (!exists) return number;
  }
  throw new CheckoutError("Could not allocate an order number, please try again.");
}

export type PlaceOrderInput = {
  lines: CartLineInput[];
  couponCode?: string | null;
  paymentMethod: string;
  paymentReference?: string | null;
  customer: { name: string; email: string; phone: string; city: string; address: string; postalCode?: string | null; notes?: string | null };
  userId?: string | null;
};

/** Re-prices the cart on the server and creates the order + decrements stock atomically. */
export async function placeOrder(input: PlaceOrderInput) {
  const quote = await quoteCart(input.lines, { couponCode: input.couponCode, paymentMethod: input.paymentMethod });
  if (!quote.lines.length || quote.itemCount === 0) throw new CheckoutError("Your bag is empty.");
  const problem = quote.lines.find((l) => l.issue);
  if (problem) throw new CheckoutError(`${problem.name} (${problem.size}): ${problem.issue}. Please review your bag.`);
  if (input.couponCode && quote.couponError) throw new CheckoutError(quote.couponError);

  const manual = ["bank", "jazzcash", "easypaisa"].includes(input.paymentMethod);

  return db.$transaction(async (tx) => {
    for (const l of quote.lines) {
      const res = await tx.productVariant.updateMany({
        where: { id: l.variantId, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (res.count !== 1) throw new CheckoutError(`${l.name} (${l.size}) just sold out. Please review your bag.`);
    }
    if (quote.coupon) {
      await tx.coupon.update({ where: { code: quote.coupon.code }, data: { usedCount: { increment: 1 } } });
    }
    const number = await nextOrderNumber(tx);
    const order = await tx.order.create({
      data: {
        number,
        userId: input.userId ?? null,
        email: input.customer.email.toLowerCase(),
        phone: input.customer.phone,
        customerName: input.customer.name,
        city: input.customer.city,
        address: input.customer.address,
        postalCode: input.customer.postalCode || null,
        notes: input.customer.notes || null,
        paymentMethod: input.paymentMethod,
        paymentStatus: manual && input.paymentReference ? "PENDING_VERIFICATION" : "UNPAID",
        paymentReference: input.paymentReference || null,
        subtotal: quote.subtotal,
        discount: quote.discount,
        shippingFee: quote.shippingFee + quote.paymentFee,
        total: quote.total,
        couponCode: quote.coupon?.code ?? null,
        items: {
          create: quote.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            name: l.name,
            sku: l.sku,
            size: l.size,
            color: l.color,
            image: l.image,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            lineTotal: l.lineTotal,
          })),
        },
        events: { create: { status: "PENDING", message: "Order placed", actor: "customer" } },
      },
    });
    return order;
  });
}

/** Restock items when an order is cancelled (idempotent per status change). */
export async function restockOrder(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    if (it.variantId) await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } }).catch(() => null);
  }
}
