import type { ClientSession } from "mongoose";
import { conflict } from "../../lib/http-error.js";
import { Product } from "../catalog/product.model.js";

export type StockItem = { productId: string; variantId: string; quantity: number };

/**
 * Takes the ordered quantities out of stock. Each update only succeeds while enough stock
 * is left, so two customers can never buy the same last piece. Run it inside a transaction:
 * when an item has run out it throws, and the transaction undoes the items already taken.
 */
export async function takeStock(items: StockItem[], session: ClientSession): Promise<void> {
  for (const item of items) {
    const result = await Product.updateOne(
      { _id: item.productId, variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } } },
      { $inc: { "variants.$.stock": -item.quantity, soldCount: item.quantity } },
      { session },
    );
    if (result.modifiedCount !== 1) throw conflict("Sorry — one of your items just sold out. Please review your bag.");
  }
}

/** Puts quantities back into stock (cancelled or returned order) and un-counts the sale. */
export async function putBackStock(items: StockItem[], session: ClientSession): Promise<void> {
  if (!items.length) return;
  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, "variants._id": item.variantId },
        update: { $inc: { "variants.$.stock": item.quantity, soldCount: -item.quantity } },
      },
    })),
    { session },
  );
}
