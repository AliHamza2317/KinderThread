/**
 * DUMMY customers, orders, coupons and subscribers so the admin dashboard and
 * account pages have realistic content in the frontend-only build. All names,
 * phone numbers and emails are fictitious (emails use example.com).
 */
import type { Address, Coupon, Order, OrderEvent, OrderStatus, PaymentStatus, ReturnRequest, Subscriber, User } from "@/lib/types";
import { PRODUCTS } from "./catalog";

const NOW = new Date("2026-11-16T12:00:00+05:00").getTime();
const DAY = 864e5;
const ago = (days: number, hours = 0) => new Date(NOW - days * DAY - hours * 36e5);

export const STAFF: User[] = [
  { id: "staff_admin", email: "admin@kinderthread.pk", name: "Store Admin", phone: null, role: "ADMIN", tags: [], isActive: true, createdAt: ago(60), lastLoginAt: ago(0, 2) },
  { id: "staff_sana", email: "sana@kinderthread.pk", name: "Sana (Orders)", phone: null, role: "STAFF", tags: [], isActive: true, createdAt: ago(40), lastLoginAt: ago(1) },
];

const C = (i: number, name: string, email: string, phone: string, city: string, days: number, tags: string[] = []): User => ({
  id: `cust_${i}`,
  email,
  name,
  phone,
  role: "CUSTOMER",
  tags,
  isActive: true,
  createdAt: ago(days),
  lastLoginAt: ago(Math.max(0, days - 3)),
});

export const CUSTOMERS: User[] = [
  C(1, "Ayesha Khan", "ayesha.khan@example.com", "03001234567", "Lahore", 45, ["vip"]),
  C(2, "Bilal Ahmed", "bilal.ahmed@example.com", "03211234568", "Karachi", 38),
  C(3, "Fatima Raza", "fatima.raza@example.com", "03331234569", "Islamabad", 30, ["twins"]),
  C(4, "Hamza Siddiqui", "hamza.s@example.com", "03451234570", "Rawalpindi", 25),
  C(5, "Mahnoor Iqbal", "mahnoor.iqbal@example.com", "03121234571", "Faisalabad", 19),
  C(6, "Usman Tariq", "usman.tariq@example.com", "03061234572", "Multan", 12),
  C(7, "Zainab Malik", "zainab.malik@example.com", "03151234573", "Lahore", 6),
  C(8, "Ali Hassan", "ali.hassan@example.com", "03221234574", "Peshawar", 2),
];

/** The signed-in customer shown in the demo account pages. */
export const DEMO_CUSTOMER = CUSTOMERS[0];

export const ADDRESSES: Address[] = [
  { id: "addr_1", userId: "cust_1", label: "Home", fullName: "Ayesha Khan", phone: "03001234567", city: "Lahore", line1: "House 24, Street 7, Block C, Model Town", line2: "Near the community park", postalCode: "54700", isDefault: true, createdAt: ago(45) },
  { id: "addr_2", userId: "cust_1", label: "Parents", fullName: "Ayesha Khan", phone: "03001234567", city: "Islamabad", line1: "House 3, Street 12, F-8/2", line2: null, postalCode: "44000", isDefault: false, createdAt: ago(20) },
  { id: "addr_3", userId: "cust_2", label: "Home", fullName: "Bilal Ahmed", phone: "03211234568", city: "Karachi", line1: "Flat 5, Block 7, Clifton", line2: null, postalCode: "75600", isDefault: true, createdAt: ago(38) },
];

const variant = (slug: string, index = 0) => {
  const p = PRODUCTS.find((x) => x.slug === slug)!;
  const v = p.variants.filter((x) => x.stock > 0)[index] ?? p.variants[index];
  const color = p.colors.find((c) => c.id === v.colorId);
  const image = p.images.find((i) => i.colorId === v.colorId) ?? p.images[0];
  return { p, v, color: color?.name ?? null, image: image?.url ?? null };
};

let eventId = 0;
const ev = (status: OrderStatus | null, message: string, at: Date, isPublic = true, actor = "staff"): OrderEvent => ({ id: `ev_${++eventId}`, status, message, isPublic, actor, createdAt: at });

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const LABEL: Record<string, string> = { PENDING: "Order placed", CONFIRMED: "Order confirmed", PROCESSING: "Being packed", SHIPPED: "Shipped", DELIVERED: "Delivered" };

type Spec = {
  n: string;
  customer?: number;
  guest?: { name: string; email: string; phone: string; city: string };
  lines: [string, number, number?][];
  status: OrderStatus;
  days: number;
  payment?: string;
  paymentStatus?: PaymentStatus;
  ref?: string;
  coupon?: string;
  courier?: [string, string];
  note?: string;
};

function makeOrder(s: Spec): Order {
  const cust = s.customer ? CUSTOMERS[s.customer - 1] : null;
  const addr = cust ? ADDRESSES.find((a) => a.userId === cust.id) : null;
  const items = s.lines.map(([slug, qty, idx], i) => {
    const { p, v, color, image } = variant(slug, idx ?? 0);
    const unitPrice = v.price ?? p.price;
    return { id: `${s.n}_i${i}`, productId: p.id, variantId: v.id, name: p.name, sku: v.sku, size: v.size, color, image, unitPrice, quantity: qty, lineTotal: unitPrice * qty };
  });
  const subtotal = items.reduce((t, i) => t + i.lineTotal, 0);
  const discount = s.coupon === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const shippingFee = s.coupon === "FREESHIP" || subtotal - discount >= 4000 ? 0 : 250;
  const placed = ago(s.days);
  const events: OrderEvent[] = [ev("PENDING", "Order placed", placed, true, "customer")];
  if (s.status === "CANCELLED") events.push(ev("CANCELLED", "Order cancelled — customer requested cancellation", ago(s.days - 0.3)));
  else {
    const reach = s.status === "RETURNED" ? 4 : FLOW.indexOf(s.status);
    for (let i = 1; i <= reach; i++) {
      const at = new Date(placed.getTime() + i * 0.8 * DAY);
      const msg = FLOW[i] === "SHIPPED" && s.courier ? `Shipped with ${s.courier[0]} — tracking number ${s.courier[1]}` : LABEL[FLOW[i]];
      events.push(ev(FLOW[i], msg, at));
    }
    if (s.status === "RETURNED") events.push(ev("RETURNED", "Return received and refunded", ago(Math.max(0, s.days - 5))));
  }
  return {
    id: `ord_${s.n}`,
    number: s.n,
    userId: cust?.id ?? null,
    email: cust?.email ?? s.guest!.email,
    phone: cust?.phone ?? s.guest!.phone,
    customerName: cust?.name ?? s.guest!.name,
    city: addr?.city ?? s.guest?.city ?? "Lahore",
    address: addr ? [addr.line1, addr.line2].filter(Boolean).join(", ") : "House 9, Street 2, Gulberg III",
    postalCode: addr?.postalCode ?? null,
    notes: s.note ?? null,
    status: s.status,
    paymentMethod: s.payment ?? "cod",
    paymentStatus: s.paymentStatus ?? (s.status === "DELIVERED" ? "PAID" : s.status === "RETURNED" ? "REFUNDED" : "UNPAID"),
    paymentReference: s.ref ?? null,
    subtotal,
    discount,
    shippingFee,
    total: subtotal - discount + shippingFee,
    couponCode: s.coupon ?? null,
    courier: s.courier?.[0] ?? null,
    trackingNumber: s.courier?.[1] ?? null,
    trackingUrl: null,
    internalNote: null,
    items,
    events,
    createdAt: placed,
    updatedAt: events[events.length - 1].createdAt,
  };
}

export const ORDERS: Order[] = [
  makeOrder({ n: "KT2611-48213", customer: 8, lines: [["tulle-party-dress", 1], ["hand-crochet-booties", 1]], status: "PENDING", days: 0.2 }),
  makeOrder({ n: "KT2611-47109", guest: { name: "Rabia Noor", email: "rabia.noor@example.com", phone: "03341234575", city: "Hyderabad" }, lines: [["printed-bodysuit-3-pack", 2]], status: "PENDING", days: 0.6, payment: "bank", paymentStatus: "PENDING_VERIFICATION", ref: "TRX-883201" }),
  makeOrder({ n: "KT2611-46655", customer: 7, lines: [["linen-grandad-shirt", 1, 2], ["everyday-crew-tee", 2]], status: "CONFIRMED", days: 1.2, coupon: "WELCOME10" }),
  makeOrder({ n: "KT2611-45320", customer: 6, lines: [["chunky-knit-sweater", 1], ["ribbed-knit-beanie", 1]], status: "PROCESSING", days: 2 }),
  makeOrder({ n: "KT2611-44018", customer: 1, lines: [["nordic-yoke-cardigan", 1], ["polka-dot-smock-dress", 1]], status: "SHIPPED", days: 3, courier: ["TCS", "TCS-77812045"] }),
  makeOrder({ n: "KT2611-42877", customer: 5, lines: [["lace-occasion-dress", 1]], status: "SHIPPED", days: 4, payment: "jazzcash", paymentStatus: "PAID", ref: "JC-55190", courier: ["Leopards", "LP-90231"] }),
  makeOrder({ n: "KT2611-41562", customer: 1, lines: [["cable-knit-bloomers", 1], ["knitted-hat-mitten-set", 1]], status: "DELIVERED", days: 5, courier: ["TCS", "TCS-77810311"] }),
  makeOrder({ n: "KT2611-40249", customer: 3, lines: [["frill-romper-bloomer-set", 2], ["hand-crochet-booties", 2, 1]], status: "DELIVERED", days: 7, coupon: "FREESHIP", courier: ["PostEx", "PX-118402"] }),
  makeOrder({ n: "KT2611-39804", customer: 2, lines: [["everyday-socks-5-pack", 3], ["everyday-crew-tee", 1]], status: "DELIVERED", days: 10 }),
  makeOrder({ n: "KT2611-38450", customer: 4, lines: [["linen-grandad-shirt", 2]], status: "CANCELLED", days: 11 }),
  makeOrder({ n: "KT2611-37193", customer: 3, lines: [["tulle-party-dress", 1]], status: "RETURNED", days: 16 }),
  makeOrder({ n: "KT2610-36021", customer: 1, lines: [["lace-occasion-dress", 1], ["hand-crochet-booties", 1]], status: "DELIVERED", days: 24, courier: ["TCS", "TCS-77801190"] }),
  makeOrder({ n: "KT2610-34788", customer: 2, lines: [["chunky-knit-sweater", 1]], status: "DELIVERED", days: 29 }),
  makeOrder({ n: "KT2610-33410", guest: { name: "Sadia Javed", email: "sadia.j@example.com", phone: "03011234576", city: "Sialkot" }, lines: [["cable-knit-bloomers", 1]], status: "DELIVERED", days: 34, payment: "easypaisa", paymentStatus: "PAID", ref: "EP-77120" }),
];

export const RETURNS: ReturnRequest[] = [
  { id: "ret_1", orderId: "ord_KT2611-40249", type: "EXCHANGE", status: "REQUESTED", reason: "Wrong size", details: "Could we exchange the romper set for 18-24M please?", adminNote: null, createdAt: ago(1), updatedAt: ago(1) },
  { id: "ret_2", orderId: "ord_KT2611-37193", type: "RETURN", status: "COMPLETED", reason: "Didn't fit", details: null, adminNote: "Received in good condition, refunded by bank transfer.", createdAt: ago(12), updatedAt: ago(9) },
];

export const COUPONS: Coupon[] = [
  { id: "cpn_welcome", code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minSubtotal: 1500, maxUses: null, usedCount: 1, startsAt: null, endsAt: null, isActive: true, createdAt: ago(50) },
  { id: "cpn_freeship", code: "FREESHIP", description: "Free delivery", type: "FREE_SHIPPING", value: 0, minSubtotal: 2000, maxUses: 100, usedCount: 1, startsAt: null, endsAt: null, isActive: true, createdAt: ago(50) },
  { id: "cpn_winter", code: "WINTER500", description: "Rs. 500 off winter knits", type: "FIXED", value: 500, minSubtotal: 3000, maxUses: 50, usedCount: 0, startsAt: ago(-5), endsAt: ago(-40), isActive: true, createdAt: ago(3) },
];

export const SUBSCRIBERS: Subscriber[] = [
  ...["hina.r", "sara.m", "omar.f", "nida.k", "kiran.a", "maria.z"].map((n, i) => ({ id: `sub_n${i}`, email: `${n}@example.com`, source: "NEWSLETTER" as const, isActive: i !== 3, createdAt: ago(3 + i * 4) })),
  ...["aliya.s", "fahad.n", "rimsha.t"].map((n, i) => ({ id: `sub_l${i}`, email: `${n}@example.com`, source: "LAUNCH" as const, isActive: true, createdAt: ago(20 + i) })),
  { id: "sub_t0", email: "zoya.h@example.com", source: "TRYON" as const, isActive: true, createdAt: ago(8) },
  { id: "sub_c0", email: "ayesha.khan@example.com", source: "CHECKOUT" as const, isActive: true, createdAt: ago(5) },
];

/** Every user (staff + customers) — handy for lookups. */
export const USERS: User[] = [...STAFF, ...CUSTOMERS];
