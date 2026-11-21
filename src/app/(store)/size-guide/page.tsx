import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Gift, MessageCircle, RefreshCw, Ruler, Shirt } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/page-hero";
import { FitFinder, GrowthRuler, MeasureGuide, SizeChart, SizeGuideProvider, type GuideData } from "@/components/size-guide/explorer";
import { WhatsAppIcon } from "@/components/ui/social-icons";
import { SplitWords } from "@/components/ui/reveal";
import { SIZE_GUIDES } from "@/data/catalog";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Kinder Thread size guide for ages 0–5: find your little one's size by height, with chest, waist and length measurements in cm or inches.",
  alternates: { canonical: "/size-guide" },
};

const FACTS = [
  { icon: Ruler, text: "Sizes from newborn to 5 years" },
  { icon: Shirt, text: "Measured on the child, not the garment" },
  { icon: ArrowUp, text: "Between two sizes? Choose the larger" },
];

export default async function SizeGuidePage() {
  const settings = await getSettings();
  const guides = [...SIZE_GUIDES].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
  const [main, ...others] = guides.map<GuideData & { id: string }>((g) => ({ id: g.id, name: g.name, unit: g.unit, rows: g.rows, notes: g.notes }));
  const days = settings.policies.returnWindowDays;
  const wa = settings.store.whatsapp;

  const NOTES = [
    { icon: ArrowUp, title: "Between sizes", body: "Choose the larger size — little ones grow quickly, and a little room is comfier." },
    { icon: Gift, title: "Buying a gift?", body: "If you don't know the baby's size yet, 3–6M is the safest choice — it's worn the longest." },
    {
      icon: RefreshCw,
      title: "Easy exchanges",
      body: days > 0 ? `Not quite right? Exchange for another size within ${days} days of delivery, subject to availability.` : "Not quite right? Get in touch and we'll help you exchange for another size.",
    },
  ];

  if (!main) {
    return (
      <div className="container-kt py-24 text-center">
        <h1 className="display-md">Size guide</h1>
        <p className="mt-3 text-cocoa-500">Size charts will be published soon.</p>
      </div>
    );
  }

  return (
    <SizeGuideProvider guide={main}>
      {/* hero: the promise on the left, the fit finder on the right */}
      <section className="relative isolate overflow-hidden border-b border-cocoa/[0.06] bg-cream-100">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-sage-200/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-80 w-[36rem] rounded-full bg-cream-50/80 blur-3xl" />
        <div className="container-kt grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,27rem)] lg:gap-16 lg:py-20 xl:grid-cols-[minmax(0,1fr)_auto_29rem] xl:gap-14">
          <div>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Size guide" }]} className="mb-5" />
            <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-cocoa-500 uppercase">Fit &amp; sizing</p>
            <h1 className="mt-3 font-display text-[clamp(2.1rem,1.2rem+3.6vw,4.6rem)] leading-[0.98] font-medium tracking-[-0.045em] text-cocoa">
              <SplitWords text="Find the *perfect* fit" />
            </h1>
            <p className="mt-5 max-w-[34rem] text-[1.02rem] leading-relaxed text-cocoa-500 md:text-[1.08rem]">
              Our sizes follow your child&apos;s age, but every little one grows at their own pace — height is the surest guide. Move the slider to find their size, or browse the full chart below.
            </p>
            <ul className="mt-7 grid max-w-[34rem] gap-2.5 sm:grid-cols-1">
              {FACTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[0.92rem] text-cocoa-600">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-50 text-sage-700 ring-1 ring-cocoa/[0.06]">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-8 hidden flex-wrap gap-2.5 lg:flex">
              <a href="#size-chart" className="inline-flex h-11 items-center gap-2 rounded-full border border-cocoa/15 bg-cream-50/70 px-5 text-[0.88rem] font-semibold text-cocoa hover:border-cocoa">
                Size chart <ArrowDown className="h-4 w-4" />
              </a>
              <a href="#how-to-measure" className="inline-flex h-11 items-center gap-2 rounded-full border border-cocoa/15 bg-cream-50/70 px-5 text-[0.88rem] font-semibold text-cocoa hover:border-cocoa">
                How to measure <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>
          <GrowthRuler className="hidden xl:block" />
          <FitFinder />
        </div>
      </section>

      {/* chart */}
      <section id="size-chart" className="container-kt scroll-mt-28 py-14 md:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 md:mb-9">
          <div>
            <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-sage-700 uppercase">Size chart</p>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,1rem+2.2vw,3rem)] leading-[1.02] font-medium tracking-[-0.04em] text-cocoa">
              <SplitWords text="Every size, at a *glance*" />
            </h2>
          </div>
          <p className="max-w-sm text-[0.92rem] leading-relaxed text-cocoa-500">
            {main.name}. Body measurements of the child; length is the back length of the top.
          </p>
        </div>
        <SizeChart />
        {main.notes && <p className="mt-4 text-[0.8rem] text-cocoa-400">{main.notes}</p>}

        {others.map((g) => (
          <div key={g.id} className="mt-14">
            <h3 className="mb-5 font-display text-[1.6rem] font-medium tracking-[-0.03em]">{g.name}</h3>
            <SizeGuideProvider guide={g}>
              <SizeChart />
            </SizeGuideProvider>
            {g.notes && <p className="mt-4 text-[0.8rem] text-cocoa-400">{g.notes}</p>}
          </div>
        ))}
      </section>

      {/* how to measure */}
      <section id="how-to-measure" className="container-kt scroll-mt-28">
        <div className="rounded-[2.5rem] bg-sage-50 px-5 py-10 ring-1 ring-sage-100 sm:px-10 md:py-14 lg:px-16">
          <div className="mx-auto mb-8 max-w-xl text-center md:mb-12">
            <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-sage-700 uppercase">How to measure</p>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,1rem+2.2vw,3rem)] leading-[1.02] font-medium tracking-[-0.04em] text-cocoa">
              <SplitWords text="Measure in a *minute*" />
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-cocoa-500">A soft tape measure is all you need. Measure over a thin vest, and keep the tape snug but never tight.</p>
          </div>
          <MeasureGuide />
        </div>
      </section>

      {/* notes */}
      <section className="container-kt py-14 md:py-20" aria-label="Fit notes">
        <ul className="grid gap-4 md:grid-cols-3">
          {NOTES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-cocoa/[0.05] md:p-7">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-cream-100 text-sage-700">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <h3 className="mt-5 text-[1.08rem] font-semibold tracking-[-0.01em] text-cocoa">{title}</h3>
              <p className="mt-1.5 text-[0.9rem] leading-relaxed text-cocoa-500">{body}</p>
            </li>
          ))}
        </ul>

        {/* help */}
        <div className="relative isolate mt-6 overflow-hidden rounded-[2rem] bg-cocoa-900 px-6 py-9 text-cream-50 sm:px-10 md:mt-8 md:flex md:items-center md:justify-between md:gap-10 md:py-11">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-10 -z-10 h-64 w-64 rounded-full bg-sage-600/30 blur-3xl" />
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream-50/10 text-cream-50">
              <MessageCircle className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="font-display text-[1.4rem] leading-tight md:text-[1.7rem] font-medium tracking-[-0.03em]">Still unsure about a size?</h2>
              <p className="mt-1.5 max-w-md text-[0.92rem] leading-relaxed text-cream-200/75">Send us your little one&apos;s height and age and we&apos;ll help you choose.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5 md:mt-0 md:shrink-0">
            {wa && (
              <a
                href={whatsappLink(wa, "Hi Kinder Thread! Could you help me choose a size?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-cream-50 px-6 text-[0.9rem] font-semibold text-cocoa hover:bg-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
              </a>
            )}
            <Link href="/pages/contact" className={wa ? "inline-flex h-12 items-center gap-2 rounded-full border border-cream-50/25 px-6 text-[0.9rem] font-semibold hover:border-cream-50" : "inline-flex h-12 items-center gap-2 rounded-full bg-cream-50 px-6 text-[0.9rem] font-semibold text-cocoa hover:bg-white"}>
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pages/returns" className="inline-flex h-12 items-center gap-2 rounded-full border border-cream-50/25 px-6 text-[0.9rem] font-semibold hover:border-cream-50">
              Exchanges
            </Link>
          </div>
        </div>
      </section>
    </SizeGuideProvider>
  );
}
