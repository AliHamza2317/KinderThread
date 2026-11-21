import { Router } from "express";
import * as customers from "./customer.controller.js";

/** Admin: /api/admin/customers */
export const customerAdminRouter = Router();

customerAdminRouter.get("/", customers.list);
customerAdminRouter.get("/:id", customers.get);
customerAdminRouter.patch("/:id/tags", customers.setTags);
customerAdminRouter.patch("/:id/active", customers.setActive);
