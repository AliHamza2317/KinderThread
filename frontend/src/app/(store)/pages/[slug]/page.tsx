import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { PageHero, PillNav } from "@/components/layout/page-hero";
import { Prose } from "@/components/ui/markdown";
import { renderTokens } from "@/lib/cms";
import { PAGES_DATA } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { accentLast, cn, formatDate, whatsappLink } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  return PAGES_DATA.find((p) => p.slug === slug && p.isPublished) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  if (!page) return {};
  return { title: page.title, description: page.seoDescription ?? undefined, alternates: { canonical: `/pages/${page.slug}` } };
}

/** Help & policy pages: title band, a menu of all help pages, and the text in a calm reading column. */
export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "about") redirect("/about");
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) notFound();
  const pages = PAGES_DATA.filter((p) => p.isPublished && p.slug !== "about");
  const links = [...pages.map((p) => ({ label: p.title, href: `/pages/${p.slug}`, active: p.slug === slug })), { label: "Size guide", href: "/size-guide", active: false }, { label: "Track your order", href: "/track-order", active: false }];
  return (
    <>
      <PageHero eyebrow="Help & information" title={accentLast(page.title)} description={`Last updated ${formatDate(page.updatedAt)}`} breadcrumb={[{ label: "Home", href: "/" }, { label: "Help" }, { label: page.title }]} size="sm" />
      <PillNav items={links} label="Help pages" className="mt-6 lg:hidden" />
      <div className="container-kt grid gap-10 py-10 md:py-16 lg:grid-cols-12 lg:gap-16">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav aria-label="Help pages" className="sticky top-28">
            <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.16em] text-cocoa-400 uppercase">Help & information</p>
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={l.active ? "page" : undefined}
                    className={cn("block rounded-full px-4 py-2.5 text-[0.92rem] transition-colors", l.active ? "bg-cocoa text-cream-50" : "text-cocoa-600 hover:bg-cocoa/5 hover:text-cocoa")}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {settings.store.whatsapp && (
              <a href={whatsappLink(settings.store.whatsapp, "Hi Kinder Thread!")} target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center gap-3 rounded-[1.25rem] bg-cream-100 p-4 text-[0.88rem] text-cocoa-600 hover:bg-cream-200">
                <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={1.6} /> Questions? Message us on WhatsApp
              </a>
            )}
          </nav>
        </aside>
        <article className="lg:col-span-8 lg:col-start-5">
          <div className="rounded-[2rem] border border-cocoa/10 bg-cream-50 p-6 md:p-12">
            <Prose>{renderTokens(page.body, settings)}</Prose>
          </div>
        </article>
      </div>
    </>
  );
}
