import { COUPONS } from "@/data/admin";
import { PRODUCTS } from "@/data/catalog";
import { getSettings } from "@/lib/settings";
import type { Coupon } from "@/lib/types";

export type CartLineInput = { variantId: string; quantity: number };

export type PricedLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string | null;
  sku: string;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
  stock: number;
  isSample: boolean;
  issue?: string;
};

export type CartQuote = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  paymentFee: number;
  total: number;
  coupon: { code: string; description: string | null } | null;
  couponError?: string;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  itemCount: number;
};

export const MAX_QTY_PER_LINE = 10;

export function validateCoupon(coupon: Coupon | null, subtotal: number): string | null {
  if (!coupon || !coupon.isActive) return "This code isn't valid.";
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return "This code isn't active yet.";
  if (coupon.endsAt && coupon.endsAt < now) return "This code has expired.";
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return "This code has reached its usage limit.";
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal)
    return `Spend Rs. ${coupon.minSubtotal.toLocaleString("en-PK")} or more to use this code.`;
  return null;
}

export async function quoteCart(
  input: CartLineInput[],
  opts: { couponCode?: string | null; paymentMethod?: string | null } = {},
): Promise<CartQuote> {
  const settings = await getSettings();
  const merged = new Map<string, number>();
  for (const l of input) {
    if (!l?.variantId) continue;
    const q = Math.max(0, Math.min(MAX_QTY_PER_LINE, Math.floor(Number(l.quantity) || 0)));
    if (q > 0) merged.set(l.variantId, Math.min(MAX_QTY_PER_LINE, (merged.get(l.variantId) ?? 0) + q));
  }
  // look up each variant (and its product) in the dummy catalogue
  const variants = [...merged.keys()]
    .map((id) => {
      const product = PRODUCTS.find((p) => p.variants.some((v) => v.id === id));
      const v = product?.variants.find((x) => x.id === id);
      return product && v ? { ...v, productId: product.id, product, color: product.colors.find((c) => c.id === v.colorId) ?? null } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const lines: PricedLine[] = [];
  for (const v of variants) {
    const requested = merged.get(v.id) ?? 0;
    const live = v.isActive && v.product.status === "ACTIVE";
    const quantity = live ? Math.min(requested, Math.max(0, v.stock)) : 0;
    const unitPrice = v.price ?? v.product.price;
    const img = v.product.images.find((i) => i.colorId && i.colorId === v.colorId) ?? v.product.images[0];
    let issue: string | undefined;
    if (!live) issue = "No longer available";
    else if (v.stock <= 0) issue = "Out of stock";
    else if (quantity < requested) issue = `Only ${v.stock} left — quantity updated`;
    lines.push({
      variantId: v.id,
      productId: v.productId,
      slug: v.product.slug,
      name: v.product.name,
      image: img?.url ?? null,
      size: v.size,
      color: v.color?.name ?? null,
      sku: v.sku,
      unitPrice,
      compareAtPrice: v.product.compareAtPrice,
      quantity,
      lineTotal: unitPrice * quantity,
      stock: v.stock,
      isSample: v.product.isSample,
      issue,
    });
  }
  // keep client order
  const order = [...merged.keys()];
  lines.sort((a, b) => order.indexOf(a.variantId) - order.indexOf(b.variantId));

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  let discount = 0;
  let freeShipping = false;
  let coupon: CartQuote["coupon"] = null;
  let couponError: string | undefined;
  const code = opts.couponCode?.trim().toUpperCase();
  if (code) {
    const c = COUPONS.find((x) => x.code === code) ?? null;
    const err = validateCoupon(c, subtotal);
    if (err || !c) couponError = err ?? "This code isn't valid.";
    else {
      coupon = { code: c.code, description: c.description };
      if (c.type === "PERCENT") discount = Math.round((subtotal * Math.min(100, c.value)) / 100);
      else if (c.type === "FIXED") discount = Math.min(subtotal, c.value);
      else freeShipping = true;
    }
  }
  const afterDiscount = subtotal - discount;
  const { flatRate, freeThreshold } = settings.shipping;
  const qualifiesFree = freeThreshold > 0 && afterDiscount >= freeThreshold;
  const shippingFee = subtotal === 0 || freeShipping || qualifiesFree ? 0 : flatRate;
  const paymentFee = opts.paymentMethod === "cod" && subtotal > 0 ? settings.payments.cod.fee : 0;
  return {
    lines,
    subtotal,
    discount,
    shippingFee,
    paymentFee,
    total: afterDiscount + shippingFee + paymentFee,
    coupon,
    couponError,
    freeShippingThreshold: freeThreshold,
    freeShippingRemaining: freeThreshold > 0 ? Math.max(0, freeThreshold - afterDiscount) : 0,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  };
}

export const PAYMENT_METHODS = ["cod", "bank", "jazzcash", "easypaisa", "card"] as const;
export type PaymentMethodId = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bank: "Bank Transfer",
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  card: "Card payment",
};
