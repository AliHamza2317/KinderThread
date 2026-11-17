import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/shop/shop-view";
import { Prose } from "@/components/ui/markdown";
import { renderTokens } from "@/lib/cms";
import { PAGES_DATA } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  return PAGES_DATA.find((p) => p.slug === slug && p.isPublished) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  if (!page) return {};
  return { title: page.title, description: page.seoDescription ?? undefined, alternates: { canonical: `/pages/${page.slug}` } };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "about") redirect("/about");
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) notFound();
  return (
    <article className="container-kt max-w-3xl py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <h1 className="display-lg mt-6">{page.title}</h1>
      <p className="mt-3 text-[0.8rem] text-cocoa-400">Last updated {formatDate(page.updatedAt)}</p>
      <div className="mt-10">
        <Prose>{renderTokens(page.body, settings)}</Prose>
      </div>
    </article>
  );
}
