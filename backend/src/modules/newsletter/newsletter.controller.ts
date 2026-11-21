import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import * as newsletter from "./newsletter.service.js";
import { adminSubscriberQuery, subscribeInput, subscriberActiveInput } from "./newsletter.validation.js";

type IdParams = { id: string };

/** POST /api/newsletter */
export async function subscribe(req: Request, res: Response) {
  res.status(201).json(await newsletter.subscribe(validate(subscribeInput, req.body)));
}

export async function list(req: Request, res: Response) {
  res.json(await newsletter.listSubscribers(validate(adminSubscriberQuery, req.query)));
}

export async function setActive(req: Request<IdParams>, res: Response) {
  const { isActive } = validate(subscriberActiveInput, req.body);
  res.json(await newsletter.setSubscriberActive(req.params.id, isActive));
}

export async function remove(req: Request<IdParams>, res: Response) {
  await newsletter.deleteSubscriber(req.params.id);
  res.status(204).end();
}
