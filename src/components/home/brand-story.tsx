"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal, SplitWords } from "@/components/ui/reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

export function BrandStory({ story }: { story: Story }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to("[data-parallax='slow']", { yPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to("[data-parallax='fast']", { yPercent: -22, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden py-24 md:py-36">
      <div className="container-kt relative grid items-center gap-16 lg:grid-cols-12">
        <div className="relative order-2 lg:order-1 lg:col-span-6">
          <div className="relative mr-[18%]" data-parallax="slow">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-200">
              <Image src={story.image} alt={story.imageAlt} fill sizes="(min-width: 1024px) 40vw, 80vw" className="object-cover" />
            </div>
          </div>
          {story.image2 && (
            <div className="absolute right-0 -bottom-10 w-[42%]" data-parallax="fast">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm border-[8px] border-cream bg-sage-100">
                <Image src={story.image2} alt={story.image2Alt} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
              </div>
            </div>
          )}
          {story.imagesAreSamples && <p className="mt-14 text-[0.7rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">Placeholder imagery</p>}
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="eyebrow eyebrow-rule">{story.eyebrow}</p>
          </Reveal>
          <h2 className="display-lg mt-5">
            <SplitWords text={story.heading} italicWords={[story.heading.split(" ").at(-1)?.replace(/[.,!]/g, "") ?? ""]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-6 text-lg leading-relaxed text-cocoa-500">{story.body}</p>
          </Reveal>
          {story.cta.href && (
            <Reveal delay={0.25}>
              <Link href={story.cta.href} className="group mt-8 inline-flex items-center gap-3 text-[0.95rem] font-bold">
                <span className="border-b border-cocoa pb-1 text-[0.74rem] tracking-[0.16em] uppercase">{story.cta.label}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
