import type { OrderDocument } from "./order.model.js";

/**
 * What a customer may see of an order (checkout confirmation, tracking, account):
 * no staff notes and only the public timeline events.
 */
export function toCustomerOrder(order: OrderDocument) {
  return {
    id: order.id as string,
    number: order.number,
    status: order.status,
    createdAt: order.createdAt,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    city: order.city,
    address: order.address,
    postalCode: order.postalCode ?? null,
    notes: order.notes ?? null,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    paymentFee: order.paymentFee,
    total: order.total,
    couponCode: order.couponCode ?? null,
    courier: order.courier ?? null,
    trackingNumber: order.trackingNumber ?? null,
    trackingUrl: order.trackingUrl ?? null,
    items: order.items.map((item) => ({
      productId: item.product?.toString() ?? null,
      variantId: item.variant?.toString() ?? null,
      name: item.name,
      sku: item.sku,
      size: item.size,
      color: item.color ?? null,
      image: item.image ?? null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    events: order.events
      .filter((event) => event.isPublic)
      .map((event) => ({ status: event.status ?? null, message: event.message, createdAt: event.createdAt })),
  };
}

/** Tracking by order number + phone: the same, minus the full address and email. */
export function toTrackingView(order: OrderDocument) {
  const { email: _email, address: _address, phone: _phone, notes: _notes, ...rest } = toCustomerOrder(order);
  return rest;
}
