import { Router } from "express";
import { formLimiter } from "../../middleware/rate-limit.js";
import * as newsletter from "./newsletter.controller.js";

/** Storefront: /api/newsletter */
export const newsletterRouter = Router();

newsletterRouter.post("/", formLimiter, newsletter.subscribe);

/** Admin: /api/admin/subscribers */
export const subscriberAdminRouter = Router();

subscriberAdminRouter.get("/", newsletter.list);
subscriberAdminRouter.patch("/:id/active", newsletter.setActive);
subscriberAdminRouter.delete("/:id", newsletter.remove);
