import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { PAYMENT_LABELS } from "@/lib/pricing";
import type { Settings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";
import type { NavCategory } from "./types";

export function Footer({ settings, categories, pages }: { settings: Settings; categories: NavCategory[]; pages: { slug: string; title: string }[] }) {
  const { store, social, payments } = settings;
  const socials = [
    social.instagram && { href: social.instagram, label: "Instagram", Icon: InstagramIcon },
    social.facebook && { href: social.facebook, label: "Facebook", Icon: FacebookIcon },
    social.tiktok && { href: social.tiktok, label: "TikTok", Icon: TikTokIcon },
    store.whatsapp && { href: whatsappLink(store.whatsapp), label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];
  const pay = (Object.keys(PAYMENT_LABELS) as (keyof typeof payments)[]).filter((k) => payments[k]?.enabled).map((k) => PAYMENT_LABELS[k]);
  const policy = (slug: string) => pages.find((p) => p.slug === slug);

  return (
    <footer className="mt-16 overflow-hidden rounded-t-[1.25rem] bg-cocoa-900 text-cream-100 md:mt-24 md:rounded-t-[2rem]">
      <div className="container-kt grid grid-cols-2 gap-x-6 gap-y-8 pt-10 pb-8 md:grid-cols-12 md:gap-8 md:pt-14 md:pb-10">
        <div className="col-span-2 flex items-center justify-between gap-4 md:col-span-4 md:block">
          <div className="w-[108px] shrink-0 rounded-[0.9rem] bg-cream-50 px-3 py-2">
            <Logo />
          </div>
          <p className="mt-4 hidden max-w-xs text-[0.86rem] leading-relaxed text-cream-200/70 md:block">{store.description}</p>
          {socials.length > 0 && (
            <ul className="flex gap-2 md:mt-5">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-cream-50/15 text-cream-100 transition hover:border-cream-50 hover:bg-cream-50 hover:text-cocoa">
                    <Icon width={16} height={16} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterCol title="Shop" className="md:col-span-2">
          <FooterLink href="/shop">All products</FooterLink>
          {categories.slice(0, 4).map((c) => (
            <FooterLink key={c.id} href={`/collections/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
          <FooterLink href="/collections/new-arrivals">New Arrivals</FooterLink>
        </FooterCol>

        <FooterCol title="Help" className="md:col-span-3">
          <FooterLink href="/track-order">Track your order</FooterLink>
          {policy("shipping") && <FooterLink href="/pages/shipping">Shipping & delivery</FooterLink>}
          {policy("returns") && <FooterLink href="/pages/returns">Returns & exchanges</FooterLink>}
          {policy("faq") && <FooterLink href="/pages/faq">FAQs</FooterLink>}
          <FooterLink href="/size-guide">Size guide</FooterLink>
          {policy("contact") && <FooterLink href="/pages/contact">Contact us</FooterLink>}
        </FooterCol>

        <FooterCol title="Get in touch" className="col-span-2 md:col-span-3">
          {store.whatsapp && (
            <li>
              <a href={whatsappLink(store.whatsapp, "Hi Kinder Thread!")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-cream-200/80 hover:text-cream-50">
                <WhatsAppIcon width={16} height={16} /> {store.whatsapp}
              </a>
            </li>
          )}
          {store.phone && (
            <li>
              <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-cream-200/80 hover:text-cream-50">
                <Phone className="h-4 w-4" /> {store.phone}
              </a>
            </li>
          )}
          {store.email && (
            <li>
              <a href={`mailto:${store.email}`} className="flex items-center gap-2.5 text-cream-200/80 hover:text-cream-50">
                <Mail className="h-4 w-4" /> {store.email}
              </a>
            </li>
          )}
          {store.hours && (
            <li className="flex items-center gap-2.5 text-cream-200/80">
              <Clock className="h-4 w-4" /> {store.hours}
            </li>
          )}
          {store.address && (
            <li className="flex items-start gap-2.5 text-cream-200/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {store.address}
            </li>
          )}
        </FooterCol>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container-kt flex flex-col gap-2 py-4 text-[0.75rem] text-cream-200/60 md:flex-row md:items-center md:justify-between md:gap-4">
          <p>
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          {pay.length > 0 && <p>We accept: {pay.join(" · ")}</p>}
          <div className="flex gap-5">
            {policy("privacy") && (
              <Link href="/pages/privacy" className="link-underline">
                Privacy
              </Link>
            )}
            {policy("terms") && (
              <Link href="/pages/terms" className="link-underline">
                Terms
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-3 text-cream-200/50">{title}</p>
      <ul className="flex flex-col gap-2 text-[0.88rem]">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-cream-100/85 transition-colors hover:text-cream-50 link-underline">
        {children}
      </Link>
    </li>
  );
}
