import type { z } from "zod";
import { notFound } from "../../lib/http-error.js";
import { skipFor, toPage } from "../../lib/pagination.js";
import { containsText } from "../../lib/text.js";
import { Subscriber } from "./subscriber.model.js";
import type { adminSubscriberQuery, subscribeInput } from "./newsletter.validation.js";

const THANKS = {
  NEWSLETTER: "Thank you for subscribing!",
  LAUNCH: "You're on the list! We'll email you when we open.",
  TRYON: "Thanks! We'll let you know when virtual try-on is ready.",
  CHECKOUT: "Thank you for subscribing!",
} as const;

/** Adds the email (or switches an old unsubscribed one back on). Always answers kindly. */
export async function subscribe(input: z.infer<typeof subscribeInput>) {
  if (!input.company) {
    await Subscriber.updateOne({ email: input.email }, { $set: { isActive: true }, $setOnInsert: { source: input.source } }, { upsert: true });
  }
  return { message: THANKS[input.source] };
}

export async function listSubscribers(query: z.infer<typeof adminSubscriberQuery>) {
  const filter = {
    ...(query.source && { source: query.source }),
    ...(query.q && { email: containsText(query.q) }),
  };
  const [items, total] = await Promise.all([
    Subscriber.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipFor(query))
      .limit(query.limit),
    Subscriber.countDocuments(filter),
  ]);
  return toPage(items, total, query);
}

export async function setSubscriberActive(id: string, isActive: boolean) {
  const subscriber = await Subscriber.findById(id);
  if (!subscriber) throw notFound("Subscriber not found.");
  subscriber.isActive = isActive;
  return subscriber.save();
}

export async function deleteSubscriber(id: string) {
  if (!(await Subscriber.findByIdAndDelete(id))) throw notFound("Subscriber not found.");
}
