import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SplitWords } from "@/components/ui/reveal";

type Story = {
  eyebrow: string;
  heading: string;
  body: string;
  image: string;
  imageAlt: string;
  image2: string;
  image2Alt: string;
  imagesAreSamples: boolean;
  cta: { label: string; href: string };
};

/** Editorial brand story: a large photograph with a second one layered on top, and the brand's words. */
export function BrandStory({ story }: { story: Story }) {
  const words = story.heading.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return (
    <section className="container-kt">
      <div className="grid items-center gap-12 overflow-hidden rounded-[2rem] bg-cream-100 p-3 md:rounded-[3rem] md:p-4 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] md:aspect-[5/4] md:rounded-[2.5rem]">
            <Image src={story.image} alt={story.imageAlt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          {story.image2 && (
            <div className="absolute right-4 bottom-4 w-[38%] overflow-hidden rounded-[1.25rem] border-[5px] border-cream-100 shadow-[0_24px_50px_-24px_rgb(20_16_12/0.5)] md:right-8 md:bottom-8 md:rounded-[1.6rem] md:border-[6px]">
              <div className="relative aspect-[4/5]">
                <Image src={story.image2} alt={story.image2Alt} fill sizes="(min-width: 1024px) 20vw, 38vw" className="object-cover" />
              </div>
            </div>
          )}
        </Reveal>
        <Reveal className="px-4 pb-10 md:px-8 lg:col-span-5 lg:px-0 lg:pr-12 lg:pb-0">
          <p className="eyebrow eyebrow-rule">{story.eyebrow}</p>
          <h2 className="display-lg mt-5">
            <SplitWords text={`${words.join(" ")} *${last}*`} />
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-cocoa-500">{story.body}</p>
          {story.cta.href && (
            <Link href={story.cta.href} className="group mt-8 inline-flex items-center gap-2 text-[0.92rem] font-semibold text-cocoa">
              <span className="link-underline">{story.cta.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          )}
          {story.imagesAreSamples && <p className="mt-6 text-[0.68rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">Placeholder imagery</p>}
        </Reveal>
      </div>
    </section>
  );
}
