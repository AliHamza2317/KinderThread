import "server-only";
import { formatPrice, whatsappLink } from "@/lib/utils";
import type { Settings } from "@/lib/settings";

/** Replace {{tokens}} in CMS markdown with live settings so policies never go stale. */
export function renderTokens(body: string, s: Settings) {
  const contact = [
    s.store.whatsapp && `- **WhatsApp:** [${s.store.whatsapp}](${whatsappLink(s.store.whatsapp)})`,
    s.store.phone && `- **Phone:** ${s.store.phone}`,
    s.store.email && `- **Email:** [${s.store.email}](mailto:${s.store.email})`,
    s.store.hours && `- **Hours:** ${s.store.hours}`,
    s.store.address && `- **Address:** ${s.store.address}`,
  ]
    .filter(Boolean)
    .join("\n");
  const tokens: Record<string, string> = {
    flatRate: formatPrice(s.shipping.flatRate),
    freeThreshold: formatPrice(s.shipping.freeThreshold),
    estimate: s.shipping.estimate,
    dispatchNote: s.shipping.note,
    returnDays: String(s.policies.returnWindowDays),
    email: s.store.email,
    phone: s.store.phone,
    whatsapp: s.store.whatsapp,
    storeName: s.store.name,
    contactBlock: contact || "_Contact details will be added soon._",
  };
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => (k in tokens ? tokens[k] : m));
}
