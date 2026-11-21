import type { z } from "zod";
import { badRequest, type FieldErrors } from "./http-error.js";

/**
 * Checks `data` against a zod schema and returns the clean, typed value.
 * Invalid input becomes a 400 response listing the problems per field:
 *   { "message": "...", "errors": { "email": ["Enter a valid email address."] } }
 */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path.map(String).join(".") || "form";
    (errors[field] ??= []).push(issue.message);
  }
  throw badRequest(result.error.issues[0]?.message ?? "Please check the form.", errors);
}
