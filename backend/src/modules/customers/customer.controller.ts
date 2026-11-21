import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import * as customers from "./customer.service.js";
import { activeInput, customerQuery, tagsInput } from "./customer.validation.js";

type IdParams = { id: string };

export async function list(req: Request, res: Response) {
  res.json(await customers.listCustomers(validate(customerQuery, req.query)));
}

export async function get(req: Request<IdParams>, res: Response) {
  res.json(await customers.getCustomer(req.params.id));
}

export async function setTags(req: Request<IdParams>, res: Response) {
  const { tags } = validate(tagsInput, req.body);
  res.json(await customers.setTags(req.params.id, tags));
}

export async function setActive(req: Request<IdParams>, res: Response) {
  const { isActive } = validate(activeInput, req.body);
  res.json(await customers.setActive(req.params.id, isActive));
}
