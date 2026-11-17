"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

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

/**
 * A photograph that opens from a small rounded window to the full screen as you
 * scroll, with the brand line resolving over it. Phones get a simple stacked layout.
 */
export function BrandStory({ story }: { story: Story }) {
  const root = useRef<HTMLElement>(null);
  const words = story.heading.trim().split(/\s+/);
  const mid = Math.ceil(words.length / 2);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-story-stage]", start: "top top", end: "+=140%", pin: true, scrub: 0.8 },
        });
        tl.fromTo("[data-story-frame]", { clipPath: "inset(22% 33% 22% 33% round 2rem)" }, { clipPath: "inset(0% 0% 0% 0% round 0rem)", ease: "power2.inOut", duration: 1 }, 0)
          .fromTo("[data-story-img]", { scale: 1.35 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
          .fromTo("[data-story-left]", { xPercent: 0 }, { xPercent: -12, ease: "power2.inOut", duration: 1 }, 0)
          .fromTo("[data-story-right]", { xPercent: 0 }, { xPercent: 12, ease: "power2.inOut", duration: 1 }, 0)
          .fromTo("[data-story-line]", { color: "var(--color-cocoa)" }, { color: "var(--color-cream-50)", duration: 0.4 }, 0.45)
          .fromTo("[data-story-shade]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45)
          .fromTo("[data-story-card]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, 0.7);
      });
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-story-frame]", { clipPath: "inset(0% 0% 0% 0% round 0rem)" });
        gsap.set("[data-story-line]", { color: "var(--color-cream-50)" });
        gsap.set("[data-story-shade]", { opacity: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative">
      <div data-story-stage className="relative flex flex-col overflow-hidden lg:h-[100svh] lg:items-center lg:justify-center">
        {/* photograph */}
        <div data-story-frame className="relative mx-5 aspect-[4/5] overflow-hidden rounded-[1.5rem] md:mx-8 lg:absolute lg:inset-0 lg:mx-0 lg:aspect-auto lg:rounded-none lg:[clip-path:inset(22%_33%_22%_33%_round_2rem)]">
          <div data-story-img className="absolute inset-0">
            <Image src={story.image} alt={story.imageAlt} fill sizes="100vw" className="object-cover" />
          </div>
          <div data-story-shade className="absolute inset-0 bg-gradient-to-t from-cocoa-900/70 via-cocoa-900/20 to-cocoa-900/30 opacity-100 lg:opacity-0" aria-hidden />
        </div>

        {/* line */}
        <h2 className="pointer-events-none relative z-10 mt-8 px-5 font-display text-[clamp(2.6rem,1rem+6vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.055em] md:px-8 lg:mt-0 lg:flex lg:w-full lg:justify-between lg:px-12">
          <span data-story-left data-story-line className="block">
            {words.slice(0, mid).join(" ")}
          </span>{" "}
          <span data-story-right data-story-line className="block font-serif-accent font-normal text-sage-700 lg:text-cocoa">
            {words.slice(mid).join(" ")}
          </span>
        </h2>

        {/* story card */}
        <div data-story-card className="relative z-10 mx-5 mt-6 max-w-md md:mx-8 lg:absolute lg:bottom-10 lg:left-12 lg:mx-0 lg:mt-0 lg:rounded-[1.5rem] lg:bg-cream-50/90 lg:p-7 lg:backdrop-blur-xl">
          <p className="eyebrow eyebrow-rule">{story.eyebrow}</p>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-600">{story.body}</p>
          {story.cta.href && (
            <Link href={story.cta.href} className="group mt-5 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-cocoa">
              <span className="link-underline">{story.cta.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
          {story.imagesAreSamples && <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">Placeholder imagery</p>}
        </div>
      </div>
    </section>
  );
}
