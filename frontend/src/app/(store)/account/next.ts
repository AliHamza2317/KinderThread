/** Same-site relative redirect target, never back to the auth pages. */
export function cleanNext(raw: string | string[] | undefined, fallback = "/account") {
  const n = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  if (!n.startsWith("/") || n.startsWith("//") || n.startsWith("/\\") || n.length > 300) return fallback;
  if (/^\/account\/(login|register|forgot)/.test(n)) return fallback;
  return n;
}
