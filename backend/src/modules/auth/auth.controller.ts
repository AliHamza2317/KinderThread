import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { currentUser } from "../../middleware/auth.js";
import * as auth from "./auth.service.js";
import { loginInput, registerInput } from "./auth.validation.js";

/** POST /api/auth/register → { user, token } */
export async function register(req: Request, res: Response) {
  res.status(201).json(await auth.register(validate(registerInput, req.body)));
}

/** POST /api/auth/login → { user, token } (customers and staff) */
export async function login(req: Request, res: Response) {
  res.json(await auth.login(validate(loginInput, req.body)));
}

/** GET /api/auth/me → the signed-in user */
export async function me(req: Request, res: Response) {
  res.json(await auth.getMe(currentUser(req).id));
}

/** POST /api/auth/logout-all → signs out every device */
export async function logoutAll(req: Request, res: Response) {
  await auth.logoutEverywhere(currentUser(req).id);
  res.status(204).end();
}
