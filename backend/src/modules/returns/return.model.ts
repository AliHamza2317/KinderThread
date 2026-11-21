import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions } from "../../db/schema-options.js";

export const RETURN_TYPES = ["RETURN", "EXCHANGE"] as const;
export const RETURN_STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "COMPLETED"] as const;
export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export const RETURN_REASONS = [
  "Size doesn't fit",
  "Colour or style not as expected",
  "Item arrived damaged or faulty",
  "Received the wrong item",
  "Changed my mind",
  "Other",
] as const;

/** Which status a request may move to next (staff can't skip back to an earlier step). */
export const RETURN_NEXT: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED", "COMPLETED", "REJECTED"],
  RECEIVED: ["COMPLETED", "REJECTED"],
  REJECTED: ["REQUESTED"],
  COMPLETED: [],
};

/** Statuses that count as "still being handled" (only one open request per order). */
export const OPEN_RETURN_STATUSES: ReturnStatus[] = ["REQUESTED", "APPROVED", "RECEIVED"];

const returnRequestSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, enum: RETURN_TYPES, required: true },
    status: { type: String, enum: RETURN_STATUSES, default: "REQUESTED" },
    reason: { type: String, required: true },
    details: { type: String, default: null },
    adminNote: { type: String, default: null },
  },
  baseOptions,
);

export type ReturnRequestDocument = HydratedDocument<InferSchemaType<typeof returnRequestSchema>>;

export const ReturnRequest = model("ReturnRequest", returnRequestSchema);
