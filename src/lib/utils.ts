import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pkr = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

/** Format whole rupees, e.g. 2450 → "Rs. 2,450" */
export function formatPrice(amount: number) {
  return `Rs. ${pkr.format(Math.round(amount))}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("en-PK", opts).format(new Date(d));
}

/** Normalise Pakistani mobile numbers to 03XXXXXXXXX where possible */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+92")) return "0" + digits.slice(3);
  if (digits.startsWith("92") && digits.length === 12) return "0" + digits.slice(2);
  return digits;
}

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "").replace(/^0/, "92");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export function absoluteUrl(path = "/") {
  const base = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** "Baby Girls" → "Baby *Girls*": marks the last word for the serif italic accent used in headings. */
export function accentLast(text: string) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return text;
  const last = words.pop();
  return `${words.join(" ")} *${last}*`;
}
