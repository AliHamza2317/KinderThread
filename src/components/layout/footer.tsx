import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { FooterWordmark } from "./footer-wordmark";
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
    <footer className="relative mt-24 overflow-hidden rounded-t-[2rem] bg-cocoa-900 text-cream-100 md:mt-32 md:rounded-t-[3rem]">
      <div className="container-kt grid gap-12 pt-16 pb-10 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-4">
          <div className="w-[150px] rounded-[1.25rem] bg-cream-50 px-4 py-3">
            <Logo />
          </div>
          <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-cream-200/70">{store.description}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-cream-50/15 text-cream-100 transition hover:border-cream-50 hover:bg-cream-50 hover:text-cocoa">
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterCol title="Shop" className="md:col-span-2">
          <FooterLink href="/shop">All products</FooterLink>
          {categories.slice(0, 6).map((c) => (
            <FooterLink key={c.id} href={`/collections/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
          <FooterLink href="/collections/new-arrivals">New Arrivals</FooterLink>
        </FooterCol>

        <FooterCol title="Customer care" className="md:col-span-3">
          <FooterLink href="/track-order">Track your order</FooterLink>
          {policy("shipping") && <FooterLink href="/pages/shipping">Shipping & delivery</FooterLink>}
          {policy("returns") && <FooterLink href="/pages/returns">Returns & exchanges</FooterLink>}
          {policy("faq") && <FooterLink href="/pages/faq">FAQs</FooterLink>}
          <FooterLink href="/size-guide">Size guide</FooterLink>
          {policy("contact") && <FooterLink href="/pages/contact">Contact us</FooterLink>}
          <FooterLink href="/account">My account</FooterLink>
        </FooterCol>

        <FooterCol title="Get in touch" className="md:col-span-3">
          {store.whatsapp && (
            <li>
              <a href={whatsappLink(store.whatsapp, "Hi Kinder Thread!")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-cream-200/80 hover:text-cream-50">
                <WhatsAppIcon width={18} height={18} /> {store.whatsapp}
              </a>
            </li>
          )}
          {store.phone && (
            <li>
              <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-cream-200/80 hover:text-cream-50">
                <Phone className="h-[18px] w-[18px]" /> {store.phone}
              </a>
            </li>
          )}
          {store.email && (
            <li>
              <a href={`mailto:${store.email}`} className="flex items-center gap-3 text-cream-200/80 hover:text-cream-50">
                <Mail className="h-[18px] w-[18px]" /> {store.email}
              </a>
            </li>
          )}
          {store.hours && (
            <li className="flex items-center gap-3 text-cream-200/80">
              <Clock className="h-[18px] w-[18px]" /> {store.hours}
            </li>
          )}
          {store.address && (
            <li className="flex items-start gap-3 text-cream-200/80">
              <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0" /> {store.address}
            </li>
          )}
        </FooterCol>
      </div>

      <FooterWordmark text={store.name} />

      <div className="border-t border-cream-50/10">
        <div className="container-kt flex flex-col gap-4 py-6 text-[0.8rem] text-cream-200/60 md:flex-row md:items-center md:justify-between">
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
      <p className="eyebrow mb-5 text-cream-200/50">{title}</p>
      <ul className="flex flex-col gap-3 text-[0.95rem]">{children}</ul>
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
