import type { Metadata } from "next";
import Image from "next/image";
import { Feather, Gift, Heart, MessageCircle, Ruler, ShoppingBag, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/markdown";
import { Reveal, SplitWords } from "@/components/ui/reveal";
import { renderTokens } from "@/lib/cms";
import { PAGES_DATA } from "@/data/content";
import { getSettings } from "@/lib/settings";
import { accentLast } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { sparkles: Sparkles, feather: Feather, bag: ShoppingBag, chat: MessageCircle, truck: Truck, heart: Heart, ruler: Ruler, gift: Gift };

export async function generateMetadata(): Promise<Metadata> {
  const page = PAGES_DATA.find((p) => p.slug === "about");
  return { title: page?.title ?? "Our Story", description: page?.seoDescription ?? undefined, alternates: { canonical: "/about" } };
}

/** Brand story page: campaign photo with the line, an intro statement, the story beside a photo, and what we care about. */
export default async function AboutPage() {
  const page = PAGES_DATA.find((p) => p.slug === "about");
  const settings = await getSettings();
  const story = settings.home.story;
  const values = settings.home.benefits.slice(0, 3);

  return (
    <>
      {/* campaign banner */}
      <section>
        <div className="relative isolate flex min-h-[26rem] items-end overflow-hidden md:min-h-[min(72svh,40rem)]">
          <Image src={story.image} alt={story.imageAlt} fill priority sizes="100vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-cocoa-900/70 via-cocoa-900/15 to-transparent" />
          <div className="container-kt w-full pt-24 pb-10 text-cream-50 md:pb-14">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Our story" }]} className="mb-6 text-cream-200/80 [&_[aria-current]]:text-cream-50 [&_a:hover]:text-cream-50" />
            <p className="eyebrow eyebrow-rule text-cream-200">{story.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.1rem,1rem+4.6vw,5.6rem)] leading-[0.95] font-medium tracking-[-0.05em] [&_.text-sage-700]:text-sun-200">
              <SplitWords text={accentLast(story.heading)} />
            </h1>
            {story.imagesAreSamples && <p className="mt-6 text-[0.68rem] font-semibold tracking-[0.12em] text-cream-200/70 uppercase">Placeholder imagery</p>}
          </div>
        </div>
      </section>

      {/* intro statement */}
      <section className="container-kt py-20 md:py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="font-display text-[clamp(1.25rem,0.6rem+2.8vw,3.2rem)] leading-[1.12] font-medium tracking-[-0.035em] text-cocoa">{story.body}</p>
        </Reveal>
      </section>

      {/* the story */}
      {page?.isPublished && (
        <section className="container-kt pb-20 md:pb-32">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-200">
                  <Image src={story.image2 || story.image} alt={story.image2Alt || ""} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 lg:pt-6">
              <p className="eyebrow eyebrow-rule">How it started</p>
              <div className="mt-6 [&_.prose-kt]:text-[1.08rem] [&_.prose-kt_h2]:font-display [&_.prose-kt_h2]:text-[2rem] [&_.prose-kt_h2]:tracking-[-0.035em]">
                <Prose>{renderTokens(page.body, settings)}</Prose>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* what we care about */}
      {values.length > 0 && (
        <section className="pb-20 md:pb-32">
          <div className="bg-cream-100 py-14 md:py-24">
            <div className="container-kt">
              <div className="text-center">
                <p className="eyebrow eyebrow-rule justify-center">What we care about</p>
                <h2 className="mx-auto mt-3 max-w-3xl font-display text-[clamp(1.55rem,0.9rem+2.2vw,2.8rem)] leading-[1.05] font-medium tracking-[-0.035em]">
                  <SplitWords text="Little things, done with *care*" />
                </h2>
              </div>
              <Reveal stagger={0.08} className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
                {values.map((v) => {
                  const Icon = ICONS[v.icon] ?? Sparkles;
                  return (
                    <article key={v.title} className="overflow-hidden rounded-[1.75rem] bg-cream-50">
                      {v.image && (
                        <div className="relative aspect-[4/3]">
                          <Image src={v.image} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                        </div>
                      )}
                      <div className="p-6 md:p-7">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-sage-800">
                          <Icon className="h-5 w-5" strokeWidth={1.6} />
                        </span>
                        <h3 className="mt-5 font-display text-[1.3rem] leading-[1.05] md:text-[1.6rem] tracking-[-0.035em]">{v.title}</h3>
                        <p className="mt-2 text-[0.95rem] leading-relaxed text-cocoa-500">{v.body}</p>
                      </div>
                    </article>
                  );
                })}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* closing call to action */}
      <section className="container-kt pb-8 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-[clamp(1.55rem,0.9rem+2.2vw,2.8rem)] leading-[1.05] font-medium tracking-[-0.035em]">
          <SplitWords text="Come and see the *collection*" />
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            Explore the collection
          </ButtonLink>
          <ButtonLink href="/pages/contact" variant="secondary" size="lg">
            Say hello
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
