"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import {
  addOrderNoteAction,
  cancelOrderAction,
  markReturnedAction,
  updateInternalNoteAction,
  updateOrderStatusAction,
  updatePaymentStatusAction,
  updateShippingAction,
} from "@/actions/admin/sales";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/form-bits";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { ActionForm } from "./action-form";
import { COURIERS } from "./labels";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};
const FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export function StatusForm({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const idx = FLOW.indexOf(current as (typeof FLOW)[number]);
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : "";
  return (
    <ActionForm action={updateOrderStatusAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field label="Move order to" htmlFor="status">
        <Select id="status" name="status" defaultValue={next} key={current}>
          <option value="" disabled>
            Choose status
          </option>
          {FLOW.filter((s) => s !== current).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
              {FLOW.indexOf(s) < idx ? " (step back)" : ""}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note" htmlFor="status-note" optional hint="Leave blank to use the status name.">
        <Input id="status-note" name="note" maxLength={500} placeholder="e.g. Confirmed on call with customer" />
      </Field>
      <Checkbox name="isPublic" defaultChecked label="Show this update to the customer" />
      <SubmitButton size="sm" className="self-start">
        Update status
      </SubmitButton>
    </ActionForm>
  );
}

function PaymentButton({ orderId, status, label, variant = "secondary" }: { orderId: string; status: PaymentStatus; label: string; variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <ActionForm action={updatePaymentStatusAction} showMessage={false}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="paymentStatus" value={status} />
      <SubmitButton size="sm" variant={variant}>
        {label}
      </SubmitButton>
    </ActionForm>
  );
}

export function PaymentActions({ orderId, status, reference, manual }: { orderId: string; status: PaymentStatus; reference: string | null; manual: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {status !== "PAID" && <PaymentButton orderId={orderId} status="PAID" label={status === "PENDING_VERIFICATION" ? "Payment verified" : "Mark as paid"} variant="primary" />}
        {status === "UNPAID" && manual && <PaymentButton orderId={orderId} status="PENDING_VERIFICATION" label="Awaiting verification" />}
        {status === "PAID" && <PaymentButton orderId={orderId} status="REFUNDED" label="Mark refunded" />}
        {status !== "UNPAID" && <PaymentButton orderId={orderId} status="UNPAID" label="Mark unpaid" variant="ghost" />}
      </div>
      {manual && (
        <ActionForm action={updatePaymentStatusAction} className="flex items-end gap-2">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="paymentStatus" value={status} />
          <Field label="Transaction reference" htmlFor="ref" className="flex-1">
            <Input id="ref" name="paymentReference" defaultValue={reference ?? ""} maxLength={120} className="h-10" />
          </Field>
          <SubmitButton size="sm" variant="secondary">
            Save
          </SubmitButton>
        </ActionForm>
      )}
    </div>
  );
}

export function ShippingForm({
  orderId,
  courier,
  trackingNumber,
  trackingUrl,
  canMarkShipped,
}: {
  orderId: string;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  canMarkShipped: boolean;
}) {
  return (
    <ActionForm action={updateShippingAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field label="Courier" htmlFor="courier">
        <Input id="courier" name="courier" list="kt-couriers" defaultValue={courier ?? ""} maxLength={60} placeholder="e.g. TCS" />
      </Field>
      <datalist id="kt-couriers">
        {COURIERS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Field label="Tracking number" htmlFor="trackingNumber">
        <Input id="trackingNumber" name="trackingNumber" defaultValue={trackingNumber ?? ""} maxLength={80} />
      </Field>
      <Field label="Tracking link" htmlFor="trackingUrl" optional>
        <Input id="trackingUrl" name="trackingUrl" type="url" defaultValue={trackingUrl ?? ""} placeholder="https://" maxLength={400} />
      </Field>
      {canMarkShipped && <Checkbox name="markShipped" defaultChecked label="Also mark the order as shipped" />}
      <SubmitButton size="sm" className="self-start">
        Save delivery details
      </SubmitButton>
    </ActionForm>
  );
}

export function NoteForm({ orderId }: { orderId: string }) {
  return (
    <ActionForm action={addOrderNoteAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field label="Add an update" htmlFor="message">
        <Textarea id="message" name="message" maxLength={500} required className="min-h-20" placeholder="e.g. Customer asked to deliver after 5pm" />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox name="isPublic" label="Visible to customer" />
        <SubmitButton size="sm" variant="secondary">
          Add to timeline
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function InternalNoteForm({ orderId, value }: { orderId: string; value: string | null }) {
  return (
    <ActionForm action={updateInternalNoteAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor="internalNote" className="sr-only">
        Internal note
      </label>
      <Textarea id="internalNote" name="internalNote" defaultValue={value ?? ""} maxLength={2000} placeholder="Only staff can see this." className="min-h-24" />
      <SubmitButton size="sm" variant="secondary" className="self-start">
        Save note
      </SubmitButton>
    </ActionForm>
  );
}

export function CancelForm({ orderId, number }: { orderId: string; number: string }) {
  return (
    <ActionForm action={cancelOrderAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field label="Reason" htmlFor="cancel-reason" optional hint="Shown to the customer in their order timeline.">
        <Input id="cancel-reason" name="reason" maxLength={300} placeholder="e.g. Customer requested cancellation" />
      </Field>
      <ConfirmSubmit message={`Cancel order ${number}? Items will be returned to stock. This can't be undone.`} className="self-start">
        Cancel order
      </ConfirmSubmit>
    </ActionForm>
  );
}

export function ReturnedForm({ orderId, number }: { orderId: string; number: string }) {
  return (
    <ActionForm action={markReturnedAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field label="Note" htmlFor="return-note" optional>
        <Input id="return-note" name="note" maxLength={300} placeholder="e.g. Refused at doorstep" />
      </Field>
      <Checkbox name="restock" defaultChecked label="Add the items back to stock" />
      <ConfirmSubmit message={`Mark order ${number} as returned?`} variant="secondary" className="self-start">
        Mark as returned
      </ConfirmSubmit>
    </ActionForm>
  );
}

type SlipOrder = {
  number: string;
  date: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string | null;
  notes: string | null;
  paymentMethod: string;
  paymentStatus: string;
  total: string;
  codDue: string | null;
  items: { name: string; sku: string; size: string; color: string | null; quantity: number }[];
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Opens a print-ready packing slip in a new window. */
export function PackingSlipButton({ order }: { order: SlipOrder }) {
  const [blocked, setBlocked] = useState(false);
  const print = () => {
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) return setBlocked(true);
    const rows = order.items
      .map((i) => `<tr><td>${esc(i.name)}<div class="m">${esc([i.size, i.color].filter(Boolean).join(" · "))}</div></td><td>${esc(i.sku)}</td><td class="r">${i.quantity}</td><td class="c">☐</td></tr>`)
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Packing slip ${esc(order.number)}</title>
<style>
body{font:14px/1.5 system-ui,sans-serif;color:#3b2618;margin:32px}
h1{font:600 22px Georgia,serif;margin:0}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #3b2618;padding-bottom:12px;margin-bottom:18px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px}
h2{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7a5741;margin:0 0 6px}
table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e5d9cf;padding:8px 6px;text-align:left;vertical-align:top}
th{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a5741}.r{text-align:right}.c{text-align:center;font-size:18px}.m{color:#7a5741;font-size:12px}
.due{margin-top:18px;padding:12px 14px;border:2px dashed #3b2618;font-weight:700;font-size:16px;display:inline-block}
.note{margin-top:14px;padding:10px 12px;background:#f6eedd}
@media print{body{margin:12mm}}
</style></head><body>
<div class="top"><div><h1>Kinder Thread</h1><div class="m">Packing slip</div></div><div style="text-align:right"><strong>${esc(order.number)}</strong><div class="m">${esc(order.date)}</div></div></div>
<div class="grid"><div><h2>Ship to</h2><strong>${esc(order.customerName)}</strong><br>${esc(order.address)}<br>${esc(order.city)}${order.postalCode ? " " + esc(order.postalCode) : ""}<br>${esc(order.phone)}<br>${esc(order.email)}</div>
<div><h2>Payment</h2>${esc(order.paymentMethod)} — ${esc(order.paymentStatus)}<br>Order total: <strong>${esc(order.total)}</strong></div></div>
<table><thead><tr><th>Item</th><th>SKU</th><th class="r">Qty</th><th class="c">Packed</th></tr></thead><tbody>${rows}</tbody></table>
${order.codDue ? `<div class="due">Collect on delivery: ${esc(order.codDue)}</div>` : ""}
${order.notes ? `<div class="note"><h2>Customer note</h2>${esc(order.notes)}</div>` : ""}
<script>window.onload=function(){window.print()}</script>
</body></html>`);
    w.document.close();
  };
  return (
    <div>
      <Button type="button" variant="secondary" size="sm" onClick={print}>
        <Printer className="h-4 w-4" /> Packing slip
      </Button>
      {blocked && <p className="mt-1 text-[0.75rem] text-coral-700">Allow pop-ups to print the slip.</p>}
    </div>
  );
}
