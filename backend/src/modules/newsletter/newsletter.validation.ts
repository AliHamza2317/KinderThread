import { z } from "zod";
import { email } from "../../lib/fields.js";
import { SUBSCRIBER_SOURCES } from "./subscriber.model.js";

export const subscribeInput = z.object({
  email,
  source: z.enum(SUBSCRIBER_SOURCES).default("NEWSLETTER"),
  // hidden "company" field in the form: real visitors leave it empty, spam bots fill it in
  company: z.string().max(200).optional(),
});

export const adminSubscriberQuery = z.object({
  q: z.string().trim().max(80).optional(),
  source: z.enum(SUBSCRIBER_SOURCES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const subscriberActiveInput = z.object({ isActive: z.boolean() });
