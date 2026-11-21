import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions, subOptions } from "../../db/schema-options.js";

export const ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const isStaffRole = (role: Role) => role === "STAFF" || role === "ADMIN";

/** A saved delivery address (customers keep a few, one of them the default). */
const addressSchema = new Schema(
  {
    label: { type: String, default: null },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: null },
    postalCode: { type: String, default: null },
    isDefault: { type: Boolean, default: false },
  },
  subOptions,
);

/** Customers and staff share one collection; `role` tells them apart. */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "CUSTOMER", index: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    // bumped on "sign out everywhere" and password changes, which invalidates older tokens
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  baseOptions,
);

export type UserData = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserData>;

export const User = model("User", userSchema);
