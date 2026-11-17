import type { ActionResult } from "@/lib/action-result";

/**
 * The site currently runs without a database, so forms that would save data
 * show this message instead. Replace these calls with real API requests when
 * the MongoDB backend is connected.
 */
export const DEMO_MESSAGE = "Demo mode — nothing was saved. Changes will be saved once the database is connected.";

export function demoResult<T = undefined>(message = DEMO_MESSAGE): ActionResult<T> {
  return { ok: true, message };
}
