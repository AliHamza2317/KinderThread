import { ORDER_STATUSES, PAYMENT_STATUSES, type Order, type OrderStatus, type PaymentStatus } from "@/lib/types";

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
    status: status && (ORDER_STATUSES as readonly string[]).includes(status) ? (status as OrderStatus) : undefined,
    pay: pay && (PAYMENT_STATUSES as readonly string[]).includes(pay) ? (pay as PaymentStatus) : undefined,
    method: one(sp.method)?.slice(0, 20),
    q: one(sp.q)?.slice(0, 80),
    from: isDate(from) ? from : undefined,
    to: isDate(to) ? to : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Filter (dummy) orders in memory. `ignoreStatus` is used for the status tab counts. */
export function filterOrders(orders: Order[], f: OrderFilters, opts: { ignoreStatus?: boolean } = {}) {
  const from = f.from ? new Date(`${f.from}T00:00:00`) : null;
  const to = f.to ? new Date(`${f.to}T23:59:59.999`) : null;
  const q = f.q?.toLowerCase();
  const digits = f.q?.replace(/\D/g, "") ?? "";
  // match phone numbers regardless of +92 / 0 prefix
  const tail = digits.length >= 4 ? digits.replace(/^92/, "").replace(/^0/, "") : "";
  return orders.filter((o) => {
    if (!opts.ignoreStatus && f.status && o.status !== f.status) return false;
    if (f.pay && o.paymentStatus !== f.pay) return false;
    if (f.method && o.paymentMethod !== f.method) return false;
    if (from && o.createdAt < from) return false;
    if (to && o.createdAt > to) return false;
    if (q) {
      const text = [o.number, o.customerName, o.email, o.city].join(" ").toLowerCase();
      if (!text.includes(q) && !(tail && o.phone.includes(tail))) return false;
    }
    return true;
  });
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
