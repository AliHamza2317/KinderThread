import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Countdown } from "@/components/home/countdown";
import { NewsletterForm } from "@/components/home/newsletter";
import { Logo } from "@/components/ui/logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";
import { ComingSoonArt } from "./art";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `${s.prelaunch.eyebrow} — ${s.store.name}`, description: s.prelaunch.message };
}

export default async function ComingSoon() {
  const [s, user] = await Promise.all([getSettings(), getCurrentUser()]);
  if (!s.prelaunch.enabled) redirect("/");
  const { prelaunch, social, store } = s;
  const socials = [
    social.instagram && { href: social.instagram, label: "Instagram", Icon: InstagramIcon },
    social.facebook && { href: social.facebook, label: "Facebook", Icon: FacebookIcon },
    social.tiktok && { href: social.tiktok, label: "TikTok", Icon: TikTokIcon },
    store.whatsapp && { href: whatsappLink(store.whatsapp), label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-cream lg:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-between gap-12 px-6 py-10 md:px-14 md:py-14">
        <div className="w-40 md:w-48">
          <Logo href={null} priority />
        </div>
        <div className="max-w-xl">
          <p className="eyebrow eyebrow-rule">{prelaunch.eyebrow}</p>
          <h1 className="display-xl mt-5">{prelaunch.heading}</h1>
          <p className="mt-6 text-lg leading-relaxed text-cocoa-500">{prelaunch.message}</p>
          {prelaunch.launchDate && <Countdown to={prelaunch.launchDate} />}
          <NewsletterForm source="LAUNCH" tone="light" cta="Notify me" className="mt-8 max-w-lg" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-cocoa-500">
          {socials.length > 0 ? (
            <ul className="flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-cocoa-100 text-cocoa transition hover:bg-cocoa hover:text-cream">
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <p>
            © {new Date().getFullYear()} {store.name}
            {isStaff(user) && (
              <>
                {" · "}
                <Link href="/" className="font-semibold underline">
                  Preview store
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
      <ComingSoonArt />
    </main>
  );
}
