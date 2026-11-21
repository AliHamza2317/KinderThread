import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import * as staff from "./staff.controller.js";

/** Admin only: /api/admin/staff (staff change their own password via /api/account/password). */
export const staffAdminRouter = Router();

staffAdminRouter.use(requireAdmin);

staffAdminRouter.get("/", staff.list);
staffAdminRouter.post("/", staff.create);
staffAdminRouter.patch("/:id/role", staff.setRole);
staffAdminRouter.patch("/:id/active", staff.setActive);
staffAdminRouter.post("/:id/reset-password", staff.resetPassword);
