import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { baseOptions, subOptions } from "../../db/schema-options.js";

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PENDING_VERIFICATION", "PAID", "REFUNDED"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** The normal life of an order, in order. Cancelled and returned are end states. */
export const ORDER_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Order confirmed",
  PROCESSING: "Being packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

/** A copy of what was bought, so the order stays correct even if the product changes later. */
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    variant: { type: Schema.Types.ObjectId, default: null },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, default: null },
    image: { type: String, default: null },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  subOptions,
);

/** The order's timeline. Public events are shown to the customer on tracking. */
const orderEventSchema = new Schema(
  {
    status: { type: String, enum: [...ORDER_STATUSES, null], default: null },
    message: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    actor: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  subOptions,
);

const orderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, default: null },
    notes: { type: String, default: null },
    status: { type: String, enum: ORDER_STATUSES, default: "PENDING" },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "UNPAID" },
    paymentReference: { type: String, default: null },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    paymentFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: null },
    courier: { type: String, default: null },
    trackingNumber: { type: String, default: null },
    trackingUrl: { type: String, default: null },
    internalNote: { type: String, default: null },
    // true once cancelled/returned items have been put back into stock (never twice)
    stockReleased: { type: Boolean, default: false },
    items: { type: [orderItemSchema], default: [] },
    events: { type: [orderEventSchema], default: [] },
  },
  baseOptions,
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ phone: 1 });

export type OrderDocument = HydratedDocument<InferSchemaType<typeof orderSchema>>;

export const Order = model("Order", orderSchema);
