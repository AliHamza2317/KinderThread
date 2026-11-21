import { Router } from "express";
import * as coupons from "./coupon.controller.js";

/** Admin: /api/admin/coupons */
export const couponAdminRouter = Router();

couponAdminRouter.get("/", coupons.list);
couponAdminRouter.post("/", coupons.create);
couponAdminRouter.put("/:id", coupons.update);
couponAdminRouter.patch("/:id/active", coupons.setActive);
couponAdminRouter.delete("/:id", coupons.remove);
