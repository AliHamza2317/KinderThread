import { Router } from "express";
import * as returns from "./return.controller.js";

/** Admin: /api/admin/returns */
export const returnAdminRouter = Router();

returnAdminRouter.get("/", returns.list);
returnAdminRouter.patch("/:id", returns.update);
