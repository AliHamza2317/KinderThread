export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; errors?: Record<string, string[] | undefined> }
  | null;

/** Flatten zod errors into { field: [messages] } */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string[]> = {};
  for (const i of issues) {
    const k = i.path.map(String).join(".") || "form";
    (out[k] ??= []).push(i.message);
  }
  return out;
}
