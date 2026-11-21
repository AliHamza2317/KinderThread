import { Product } from "../catalog/product.model.js";
import { couponProblem, findCouponByCode } from "../coupons/coupon.service.js";
import { getSettings } from "../content/settings.service.js";
import { MAX_QTY_PER_LINE, type CartLine, type PaymentMethod } from "./cart.validation.js";

export type PricedLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  sku: string;
  size: string;
  color: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  /** what the customer asked for */
  requested: number;
  /** what can actually be bought (limited by stock) */
  quantity: number;
  lineTotal: number;
  stock: number;
  isSample: boolean;
  /** set when the line can't be bought as asked ("Out of stock" …) */
  issue: string | null;
};

export type CartQuote = {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  paymentFee: number;
  total: number;
  coupon: { code: string; description: string | null; type: string } | null;
  couponError: string | null;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
};

/** Adds up repeated lines for the same variant and keeps quantities within limits. */
function mergeLines(lines: CartLine[]): Map<string, number> {
  const merged = new Map<string, number>();
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    const quantity = Math.min(MAX_QTY_PER_LINE, (merged.get(line.variantId) ?? 0) + line.quantity);
    merged.set(line.variantId, quantity);
  }
  return merged;
}

/**
 * Prices a bag on the server — the single source of truth for checkout. Prices, stock,
 * coupon, delivery and payment fees always come from the database, never from the client.
 */
export async function quoteCart(input: CartLine[], options: { couponCode?: string; paymentMethod?: PaymentMethod } = {}): Promise<CartQuote> {
  const settings = await getSettings();
  const wanted = mergeLines(input);
  const products = await Product.find({ "variants._id": { $in: [...wanted.keys()] } });

  const lines: PricedLine[] = [];
  for (const [variantId, requested] of wanted) {
    const product = products.find((p) => p.variants.some((v) => v._id.toString() === variantId));
    const variant = product?.variants.find((v) => v._id.toString() === variantId);
    if (!product || !variant) continue; // deleted since it was added — just drop it

    const available = product.status === "ACTIVE" && variant.isActive;
    const quantity = available ? Math.min(requested, Math.max(0, variant.stock)) : 0;
    const unitPrice = variant.price ?? product.price;
    const image = product.images.find((i) => i.color && i.color === variant.color) ?? product.images[0];

    let issue: string | null = null;
    if (!available) issue = "No longer available";
    else if (variant.stock <= 0) issue = "Out of stock";
    else if (quantity < requested) issue = `Only ${variant.stock} left`;

    lines.push({
      variantId,
      productId: product.id as string,
      slug: product.slug,
      name: product.name,
      image: image?.url ?? null,
      sku: variant.sku,
      size: variant.size,
      color: variant.color ?? null,
      unitPrice,
      compareAtPrice: product.compareAtPrice ?? null,
      requested,
      quantity,
      lineTotal: unitPrice * quantity,
      stock: variant.stock,
      isSample: product.isSample,
      issue,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  // coupon
  let discount = 0;
  let freeShipping = false;
  let coupon: CartQuote["coupon"] = null;
  let couponError: string | null = null;
  if (options.couponCode) {
    const found = await findCouponByCode(options.couponCode);
    couponError = couponProblem(found, subtotal);
    if (found && !couponError) {
      coupon = { code: found.code, description: found.description ?? null, type: found.type };
      if (found.type === "PERCENT") discount = Math.round((subtotal * Math.min(100, found.value)) / 100);
      else if (found.type === "FIXED") discount = Math.min(subtotal, found.value);
      else freeShipping = true;
    }
  }

  // delivery: flat rate unless the order (after discount) reaches the free-delivery threshold
  const afterDiscount = subtotal - discount;
  const { flatRate, freeThreshold } = settings.shipping;
  const qualifiesForFree = freeThreshold > 0 && afterDiscount >= freeThreshold;
  const shippingFee = subtotal === 0 || freeShipping || qualifiesForFree ? 0 : flatRate;
  const paymentFee = options.paymentMethod === "cod" && subtotal > 0 ? settings.payments.cod.fee : 0;

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount,
    shippingFee,
    paymentFee,
    total: afterDiscount + shippingFee + paymentFee,
    coupon,
    couponError,
    freeShippingThreshold: freeThreshold,
    freeShippingRemaining: freeThreshold > 0 ? Math.max(0, freeThreshold - afterDiscount) : 0,
  };
}
