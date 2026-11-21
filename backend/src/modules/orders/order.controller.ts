import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { currentUser } from "../../middleware/auth.js";
import { findOrderForTracking, placeOrder } from "./checkout.service.js";
import * as orders from "./order.admin.service.js";
import {
  adminOrderQuery,
  cancelInput,
  checkoutInput,
  internalNoteInput,
  noteInput,
  paymentInput,
  returnedInput,
  shippingInput,
  statusInput,
  trackQuery,
} from "./order.validation.js";
import { toCustomerOrder, toTrackingView } from "./order.views.js";

type IdParams = { id: string };

/* storefront */

/** POST /api/orders — checkout. Signed-in customers get the order in their account. */
export async function checkout(req: Request, res: Response) {
  const order = await placeOrder(validate(checkoutInput, req.body), req.user?.id ?? null);
  res.status(201).json(toCustomerOrder(order));
}

/** GET /api/orders/track?number=KT2611-12345&phone=03001234567 */
export async function track(req: Request, res: Response) {
  const { number, phone } = validate(trackQuery, req.query);
  res.json(toTrackingView(await findOrderForTracking(number, phone)));
}

/* admin */

export async function list(req: Request, res: Response) {
  res.json(await orders.listOrders(validate(adminOrderQuery, req.query)));
}

export async function get(req: Request<IdParams>, res: Response) {
  res.json(await orders.getOrder(req.params.id));
}

export async function updateStatus(req: Request<IdParams>, res: Response) {
  res.json(await orders.updateStatus(req.params.id, validate(statusInput, req.body), currentUser(req)));
}

export async function addNote(req: Request<IdParams>, res: Response) {
  res.json(await orders.addNote(req.params.id, validate(noteInput, req.body), currentUser(req)));
}

export async function updateInternalNote(req: Request<IdParams>, res: Response) {
  res.json(await orders.updateInternalNote(req.params.id, validate(internalNoteInput, req.body)));
}

export async function updatePayment(req: Request<IdParams>, res: Response) {
  res.json(await orders.updatePayment(req.params.id, validate(paymentInput, req.body), currentUser(req)));
}

export async function updateShipping(req: Request<IdParams>, res: Response) {
  res.json(await orders.updateShipping(req.params.id, validate(shippingInput, req.body), currentUser(req)));
}

export async function cancel(req: Request<IdParams>, res: Response) {
  res.json(await orders.cancelOrder(req.params.id, validate(cancelInput, req.body), currentUser(req)));
}

export async function markReturned(req: Request<IdParams>, res: Response) {
  res.json(await orders.markReturned(req.params.id, validate(returnedInput, req.body), currentUser(req)));
}
