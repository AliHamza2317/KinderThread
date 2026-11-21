import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { currentUser } from "../../middleware/auth.js";
import { listReturns, updateReturn } from "./return.service.js";
import { adminReturnQuery, returnUpdateInput } from "./return.validation.js";

export async function list(req: Request, res: Response) {
  res.json(await listReturns(validate(adminReturnQuery, req.query)));
}

export async function update(req: Request<{ id: string }>, res: Response) {
  res.json(await updateReturn(req.params.id, validate(returnUpdateInput, req.body), currentUser(req)));
}
