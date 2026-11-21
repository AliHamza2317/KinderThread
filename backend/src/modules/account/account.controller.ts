import type { Request, Response } from "express";
import { objectId } from "../../lib/fields.js";
import { validate } from "../../lib/validate.js";
import { currentUser } from "../../middleware/auth.js";
import { returnRequestInput } from "../returns/return.validation.js";
import * as account from "./account.service.js";
import { addressInput, passwordInput, profileInput, wishlistInput } from "./account.validation.js";

/** Every route here is behind requireAuth (see account.routes.ts). */

const userId = (req: Request) => currentUser(req).id;

export async function updateProfile(req: Request, res: Response) {
  res.json(await account.updateProfile(userId(req), validate(profileInput, req.body)));
}

export async function changePassword(req: Request, res: Response) {
  const { current, password } = validate(passwordInput, req.body);
  res.json(await account.changePassword(userId(req), current, password));
}

export async function listAddresses(req: Request, res: Response) {
  res.json(await account.listAddresses(userId(req)));
}

export async function addAddress(req: Request, res: Response) {
  res.status(201).json(await account.addAddress(userId(req), validate(addressInput, req.body)));
}

export async function updateAddress(req: Request<{ id: string }>, res: Response) {
  res.json(await account.updateAddress(userId(req), validate(objectId, req.params.id), validate(addressInput, req.body)));
}

export async function setDefaultAddress(req: Request<{ id: string }>, res: Response) {
  res.json(await account.setDefaultAddress(userId(req), validate(objectId, req.params.id)));
}

export async function deleteAddress(req: Request<{ id: string }>, res: Response) {
  res.json(await account.deleteAddress(userId(req), validate(objectId, req.params.id)));
}

export async function getWishlist(req: Request, res: Response) {
  res.json(await account.getWishlist(userId(req)));
}

export async function setWishlist(req: Request, res: Response) {
  const { productIds } = validate(wishlistInput, req.body);
  res.json(await account.setWishlist(userId(req), productIds));
}

export async function addToWishlist(req: Request<{ productId: string }>, res: Response) {
  res.json(await account.addToWishlist(userId(req), validate(objectId, req.params.productId)));
}

export async function removeFromWishlist(req: Request<{ productId: string }>, res: Response) {
  res.json(await account.removeFromWishlist(userId(req), validate(objectId, req.params.productId)));
}

export async function listOrders(req: Request, res: Response) {
  res.json(await account.listMyOrders(userId(req)));
}

export async function getOrder(req: Request<{ number: string }>, res: Response) {
  res.json(await account.getMyOrder(userId(req), req.params.number));
}

export async function requestReturn(req: Request<{ number: string }>, res: Response) {
  res.status(201).json(await account.requestMyReturn(userId(req), req.params.number, validate(returnRequestInput, req.body)));
}
