import { Router } from "express";
import * as dashboard from "./dashboard.controller.js";

/** Admin: /api/admin/dashboard */
export const dashboardAdminRouter = Router();

dashboardAdminRouter.get("/", dashboard.dashboard);
