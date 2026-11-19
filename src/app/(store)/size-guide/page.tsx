import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Baby, Ruler, Shirt } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SizeGuideTable } from "@/components/product/size-guide";
import { SIZE_GUIDES } from "@/data/catalog";
import { AGE_GROUPS } from "@/lib/sizes";

export const metadata: Metadata = { title: "Size guide", description: "Kinder Thread size guide for ages 0–5 with height and chest measurements.", alternates: { canonical: "/size-guide" } };

const TIPS = [
  { icon: Ruler, title: "Measure height", body: "Stand your little one against a wall, no shoes, and measure from the floor to the top of the head." },
  { icon: Shirt, title: "Check the chest", body: "Measure around the fullest part of the chest, keeping the tape snug but not tight." },
  { icon: Baby, title: "Between sizes?", body: "Choose the larger size — little ones grow quickly and a little room is comfier." },
];

export default async function SizeGuidePage() {
  const guides = [...SIZE_GUIDES].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
  return (
    <>
      <PageHero
        eyebrow="Fit & sizing"
        title="Size *guide*"
        description="Our sizes follow your child's age, but every little one grows differently — height is your best guide."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Size guide" }]}
      >
        <div className="flex flex-wrap justify-center gap-2">
          {AGE_GROUPS.map((a) => {
            const [name, range] = a.label.split(" · ");
            return (
              <Link key={a.id} href={`/shop?age=${a.id}`} className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-cocoa/12 bg-cream-50/70 px-4 text-[0.85rem] font-medium text-cocoa hover:border-cocoa">
                {name} <span className="text-cocoa-400">{range}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-cocoa-400 transition-transform group-hover:rotate-45" />
              </Link>
            );
          })}
        </div>
      </PageHero>

      <div className="container-kt max-w-5xl py-12 md:py-16">
        <section aria-labelledby="measure-h">
          <h2 id="measure-h" className="sr-only">
            How to measure
          </h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {TIPS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-[1.75rem] border border-cocoa/10 bg-cream-50 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-sage-800">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display text-[1.35rem] tracking-[-0.03em]">{title}</h3>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-cocoa-500">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {guides.length === 0 && <p className="mt-10 text-cocoa-500">Size charts will be published soon.</p>}
        {guides.map((g) => (
          <section key={g.id} className="mt-12 md:mt-16">
            <h2 className="display-md">{g.name}</h2>
            <div className="mt-6 overflow-hidden rounded-[2rem] bg-cream-100 p-4 md:p-8">
              <SizeGuideTable guide={{ name: g.name, unit: g.unit, rows: g.rows, notes: g.notes }} />
            </div>
            {g.notes && <p className="mt-3 text-[0.85rem] text-cocoa-500">{g.notes}</p>}
          </section>
        ))}
      </div>
    </>
  );
}
