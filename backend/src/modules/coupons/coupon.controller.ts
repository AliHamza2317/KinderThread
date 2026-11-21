import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import * as coupons from "./coupon.service.js";
import { couponActiveInput, couponInput } from "./coupon.validation.js";

type IdParams = { id: string };

export async function list(_req: Request, res: Response) {
  res.json(await coupons.listCoupons());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await coupons.createCoupon(validate(couponInput, req.body)));
}

export async function update(req: Request<IdParams>, res: Response) {
  res.json(await coupons.updateCoupon(req.params.id, validate(couponInput, req.body)));
}

export async function setActive(req: Request<IdParams>, res: Response) {
  const { isActive } = validate(couponActiveInput, req.body);
  res.json(await coupons.setCouponActive(req.params.id, isActive));
}

export async function remove(req: Request<IdParams>, res: Response) {
  await coupons.deleteCoupon(req.params.id);
  res.status(204).end();
}
