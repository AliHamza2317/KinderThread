import { Product } from "../catalog/product.model.js";

export type StockItem = { productId: string; variantId: string; quantity: number };

/**
 * Takes the ordered quantities out of stock. Each update only succeeds while enough stock
 * is left, so two customers can never buy the same last piece. All-or-nothing: if one item
 * runs out, the items already taken are put back and false is returned.
 */
export async function reserveStock(items: StockItem[]): Promise<boolean> {
  const taken: StockItem[] = [];
  for (const item of items) {
    const result = await Product.updateOne(
      { _id: item.productId, variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } } },
      { $inc: { "variants.$.stock": -item.quantity } },
    );
    if (result.modifiedCount !== 1) {
      await releaseStock(taken);
      return false;
    }
    taken.push(item);
  }
  return true;
}

/** Puts quantities back into stock (failed checkout, cancelled or returned order). */
export async function releaseStock(items: StockItem[]): Promise<void> {
  if (!items.length) return;
  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, "variants._id": item.variantId },
        update: { $inc: { "variants.$.stock": item.quantity } },
      },
    })),
  );
}

/** Keeps the "units sold" counter used by the best-seller sort. */
export async function recordSales(items: StockItem[], direction: 1 | -1 = 1): Promise<void> {
  if (!items.length) return;
  await Product.bulkWrite(
    items.map((item) => ({ updateOne: { filter: { _id: item.productId }, update: { $inc: { soldCount: direction * item.quantity } } } })),
  );
}
