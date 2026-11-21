import { assertStaff } from "@/lib/auth";
import { ORDERS } from "@/data/admin";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { filterOrders, parseOrderFilters } from "@/components/admin/sales/order-query";
import { PAYMENT_STATUS_LABEL } from "@/components/admin/sales/labels";

const MAX_ROWS = 10000;

function csvCell(v: unknown) {
  if (v === null || v === undefined) return "";
  let s = v instanceof Date ? v.toISOString() : String(v);
  // neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  await assertStaff();

  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const f = parseOrderFilters(sp);
  const orders = filterOrders(ORDERS, f)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_ROWS);

  const header = [
    "Order number", "Date", "Status", "Payment method", "Payment status", "Payment reference", "Customer", "Phone", "Email", "City",
    "Address", "Postal code", "Items", "Units", "Subtotal (PKR)", "Discount (PKR)", "Delivery (PKR)", "Total (PKR)", "Coupon", "Courier",
    "Tracking number", "Customer notes",
  ];
  const rows = orders.map((o) => [
    o.number,
    o.createdAt,
    ORDER_STATUS_LABEL[o.status],
    PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod,
    PAYMENT_STATUS_LABEL[o.paymentStatus],
    o.paymentReference,
    o.customerName,
    o.phone,
    o.email,
    o.city,
    o.address,
    o.postalCode,
    o.items.map((i) => `${i.name} (${[i.size, i.color].filter(Boolean).join("/")}) ×${i.quantity} [${i.sku}]`).join("; "),
    o.items.reduce((n, i) => n + i.quantity, 0),
    o.subtotal,
    o.discount,
    o.shippingFee,
    o.total,
    o.couponCode,
    o.courier,
    o.trackingNumber,
    o.notes,
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kinder-thread-orders-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
