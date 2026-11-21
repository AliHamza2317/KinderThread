import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions, subOptions } from "../../db/schema-options.js";

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export const GENDERS = ["BOY", "GIRL", "UNISEX"] as const;

const colorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  subOptions,
);

/** `color` is the name of one of the product's colours (or null for every colour). */
const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    color: { type: String, default: null },
  },
  subOptions,
);

/** One buyable size/colour combination with its own SKU and stock. */
const variantSchema = new Schema(
  {
    sku: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, default: null },
    // null = use the product price
    price: { type: Number, default: null },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  subOptions,
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    fabric: { type: String, default: null },
    care: { type: String, default: null },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    status: { type: String, enum: PRODUCT_STATUSES, default: "DRAFT" },
    gender: { type: String, enum: GENDERS, default: "UNISEX" },
    isSample: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
    sizeGuide: { type: Schema.Types.ObjectId, ref: "SizeGuide", default: null },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    colors: { type: [colorSchema], default: [] },
    images: { type: [imageSchema], default: [] },
    variants: { type: [variantSchema], default: [] },
    // units sold, kept up to date by checkout (used for the "best selling" sort)
    soldCount: { type: Number, default: 0 },
  },
  baseOptions,
);

productSchema.index({ status: 1, isFeatured: -1, sortOrder: 1 });
productSchema.index({ categories: 1, status: 1 });
// a SKU can belong to only one product
productSchema.index({ "variants.sku": 1 }, { unique: true, partialFilterExpression: { "variants.sku": { $exists: true } } });

export type ProductDocument = HydratedDocument<InferSchemaType<typeof productSchema>>;

export const Product = model("Product", productSchema);
