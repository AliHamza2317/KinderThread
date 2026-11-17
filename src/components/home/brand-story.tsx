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
      // the golden thread stitches the section together as you scroll
      gsap.fromTo(
        "[data-story-thread]",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: 0.8 } },
      );
      gsap.to("[data-parallax='slow']", { yPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to("[data-parallax='fast']", { yPercent: -22, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden py-24 md:py-36">
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 1440 1000" preserveAspectRatio="none" aria-hidden>
        <path
          data-story-thread
          pathLength={1}
          strokeDasharray="1"
          d="M1480 80 C 1200 40, 1050 220, 900 200 S 700 120, 640 330 S 760 640, 560 720 S 260 700, 150 880 S 60 1000, -40 960"
          fill="none"
          stroke="#EDAF4B"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="container-kt relative grid items-center gap-16 lg:grid-cols-12">
        <div className="relative order-2 lg:order-1 lg:col-span-6">
          <div className="relative mr-[18%]" data-parallax="slow">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
              <Image src={story.image} alt={story.imageAlt} fill sizes="(min-width: 1024px) 40vw, 80vw" className="object-cover" />
            </div>
          </div>
          {story.image2 && (
            <div className="absolute right-0 -bottom-10 w-[42%]" data-parallax="fast">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border-[6px] border-cream bg-sage-100 shadow-lift">
                <Image src={story.image2} alt={story.image2Alt} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
              </div>
            </div>
          )}
          {story.imagesAreSamples && <p className="mt-4 text-[0.72rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">Sample imagery — photography coming soon</p>}
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
                <span className="grid h-12 w-12 place-items-center rounded-full bg-coral text-cocoa-900 transition-transform duration-500 group-hover:rotate-[-35deg]">
                  <ArrowRight className="h-5 w-5" />
                </span>
                <span className="link-underline">{story.cta.label}</span>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
