import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export type OrderFilters = {
  status?: OrderStatus;
  pay?: PaymentStatus;
  method?: string;
  q?: string;
  from?: string;
  to?: string;
  page: number;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export function parseOrderFilters(sp: Record<string, string | string[] | undefined>): OrderFilters {
  const status = one(sp.status);
  const pay = one(sp.pay);
  const from = one(sp.from);
  const to = one(sp.to);
  const page = Number(one(sp.page));
  return {
    status: status && status in OrderStatus ? (status as OrderStatus) : undefined,
    pay: pay && pay in PaymentStatus ? (pay as PaymentStatus) : undefined,
    method: one(sp.method)?.slice(0, 20),
    q: one(sp.q)?.slice(0, 80),
    from: isDate(from) ? from : undefined,
    to: isDate(to) ? to : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function orderWhere(f: OrderFilters): Prisma.OrderWhereInput {
  const and: Prisma.OrderWhereInput[] = [];
  if (f.status) and.push({ status: f.status });
  if (f.pay) and.push({ paymentStatus: f.pay });
  if (f.method) and.push({ paymentMethod: f.method });
  if (f.from) and.push({ createdAt: { gte: new Date(`${f.from}T00:00:00`) } });
  if (f.to) and.push({ createdAt: { lte: new Date(`${f.to}T23:59:59.999`) } });
  if (f.q) {
    const q = f.q;
    const digits = q.replace(/\D/g, "");
    const or: Prisma.OrderWhereInput[] = [
      { number: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
    if (digits.length >= 4) {
      // match phone numbers regardless of +92 / 0 prefix
      const tail = digits.replace(/^92/, "").replace(/^0/, "");
      or.push({ phone: { contains: tail } });
    }
    and.push({ OR: or });
  }
  return and.length ? { AND: and } : {};
}

/** Query string for the given filters (used for pagination & CSV export links). */
export function filtersToQuery(f: OrderFilters, overrides: Partial<Record<keyof OrderFilters, string | number | undefined>> = {}) {
  const params = new URLSearchParams();
  const merged = { ...f, ...overrides } as Record<string, string | number | undefined>;
  for (const k of ["status", "pay", "method", "q", "from", "to", "page"]) {
    const v = merged[k];
    if (v === undefined || v === "" || (k === "page" && Number(v) <= 1)) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
