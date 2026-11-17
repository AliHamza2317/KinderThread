import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/markdown";
import { Reveal, SplitWords } from "@/components/ui/reveal";
import { renderTokens } from "@/lib/cms";
import { PAGES_DATA } from "@/data/content";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const page = PAGES_DATA.find((p) => p.slug === "about");
  return { title: page?.title ?? "Our Story", description: page?.seoDescription ?? undefined, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const page = PAGES_DATA.find((p) => p.slug === "about");
  const settings = await getSettings();
  const story = settings.home.story;
  return (
    <>
      <section className="container-kt grid items-center gap-12 py-12 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow eyebrow-rule">Our story</p>
          <h1 className="display-xl mt-5">
            <SplitWords text={story.heading} italicWords={[story.heading.split(" ").at(-1)?.replace(/[.,!]/g, "") ?? ""]} />
          </h1>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cocoa-500">{story.body}</p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-6" delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-cream-200 lg:aspect-[5/5]">
            <Image src={story.image} alt={story.imageAlt} fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
          </div>
          {story.imagesAreSamples && <p className="mt-3 text-[0.72rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">Sample imagery</p>}
        </Reveal>
      </section>
      {page?.isPublished && (
        <section className="container-kt max-w-3xl pb-16">
          <Prose>{renderTokens(page.body, settings)}</Prose>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/shop">Explore the collection</ButtonLink>
            <ButtonLink href="/pages/contact" variant="secondary">
              Say hello
            </ButtonLink>
          </div>
        </section>
      )}
    </>
  );
}
