import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.js";
import { checkoutLimiter, formLimiter } from "../../middleware/rate-limit.js";
import * as orders from "./order.controller.js";

/** Storefront: /api/orders */
export const orderRouter = Router();

orderRouter.post("/", checkoutLimiter, optionalAuth, orders.checkout);
orderRouter.get("/track", formLimiter, orders.track);

/** Admin: /api/admin/orders */
export const orderAdminRouter = Router();

orderAdminRouter.get("/", orders.list);
orderAdminRouter.get("/:id", orders.get);
orderAdminRouter.patch("/:id/status", orders.updateStatus);
orderAdminRouter.post("/:id/notes", orders.addNote);
orderAdminRouter.patch("/:id/internal-note", orders.updateInternalNote);
orderAdminRouter.patch("/:id/payment", orders.updatePayment);
orderAdminRouter.patch("/:id/shipping", orders.updateShipping);
orderAdminRouter.post("/:id/cancel", orders.cancel);
orderAdminRouter.post("/:id/mark-returned", orders.markReturned);
