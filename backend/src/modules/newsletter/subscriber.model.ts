import { Schema, model } from "mongoose";
import { baseOptions } from "../../db/schema-options.js";

export const SUBSCRIBER_SOURCES = ["NEWSLETTER", "LAUNCH", "TRYON", "CHECKOUT"] as const;

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, enum: SUBSCRIBER_SOURCES, default: "NEWSLETTER" },
    isActive: { type: Boolean, default: true },
  },
  baseOptions,
);

export const Subscriber = model("Subscriber", subscriberSchema);
