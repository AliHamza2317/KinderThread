import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions } from "../../db/schema-options.js";

/** A category (Baby Girls, Newborn …) or a curated collection (Matching Sets …). */
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    image: { type: String, default: null },
    kind: { type: String, enum: ["category", "collection"], default: "category" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    showInNav: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
  },
  baseOptions,
);

export type CategoryDocument = HydratedDocument<InferSchemaType<typeof categorySchema>>;

export const Category = model("Category", categorySchema);
