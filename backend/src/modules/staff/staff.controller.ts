import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { currentUser } from "../../middleware/auth.js";
import * as staff from "./staff.service.js";
import { activeInput, createStaffInput, resetPasswordInput, roleInput } from "./staff.validation.js";

type IdParams = { id: string };

export async function list(_req: Request, res: Response) {
  res.json(await staff.listStaff());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await staff.createStaff(validate(createStaffInput, req.body)));
}

export async function setRole(req: Request<IdParams>, res: Response) {
  const { role } = validate(roleInput, req.body);
  res.json(await staff.setRole(req.params.id, role, currentUser(req)));
}

export async function setActive(req: Request<IdParams>, res: Response) {
  const { isActive } = validate(activeInput, req.body);
  res.json(await staff.setActive(req.params.id, isActive, currentUser(req)));
}

export async function resetPassword(req: Request<IdParams>, res: Response) {
  const { password } = validate(resetPasswordInput, req.body);
  res.json(await staff.resetPassword(req.params.id, password, currentUser(req)));
}
