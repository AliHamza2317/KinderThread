import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rate-limit.js";
import * as auth from "./auth.controller.js";

/** /api/auth */
export const authRouter = Router();

authRouter.post("/register", authLimiter, auth.register);
authRouter.post("/login", authLimiter, auth.login);
authRouter.get("/me", requireAuth, auth.me);
authRouter.post("/logout-all", requireAuth, auth.logoutAll);
