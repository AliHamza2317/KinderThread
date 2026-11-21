import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions, subOptions } from "../../db/schema-options.js";

/** One row of a size chart; measurements are text so ranges like "56–62" fit. */
const sizeRowSchema = new Schema(
  {
    size: { type: String, required: true },
    age: { type: String, default: "" },
    height: { type: String, default: "" },
    chest: { type: String, default: "" },
    waist: { type: String, default: "" },
    length: { type: String, default: "" },
  },
  { ...subOptions, _id: false },
);

const sizeGuideSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, enum: ["cm", "in"], default: "cm" },
    rows: { type: [sizeRowSchema], default: [] },
    notes: { type: String, default: null },
    // the guide used by products that don't pick one
    isDefault: { type: Boolean, default: false },
  },
  baseOptions,
);

export type SizeGuideDocument = HydratedDocument<InferSchemaType<typeof sizeGuideSchema>>;

export const SizeGuide = model("SizeGuide", sizeGuideSchema);
