import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { quoteInput } from "./cart.validation.js";
import { quoteCart } from "./pricing.service.js";

/** POST /api/cart/quote — live prices, stock, coupon and fees for a bag. */
export async function quote(req: Request, res: Response) {
  const { lines, couponCode, paymentMethod } = validate(quoteInput, req.body);
  res.json(await quoteCart(lines, { couponCode, paymentMethod }));
}
