export function getPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

export function setPathImmutable<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const base = (obj && typeof obj === "object" ? obj : {}) as Record<string, unknown>;
  return { ...base, [head]: rest.length ? setPathImmutable(base[head], rest.join("."), value) : value } as T;
}

export function nest(path: string, value: unknown): Record<string, unknown> {
  if (!path) return value as Record<string, unknown>;
  return path
    .split(".")
    .reverse()
    .reduce<unknown>((acc, k) => ({ [k]: acc }), value) as Record<string, unknown>;
}
