import { Router } from "express";
import * as cart from "./cart.controller.js";

/** /api/cart */
export const cartRouter = Router();

cartRouter.post("/quote", cart.quote);
