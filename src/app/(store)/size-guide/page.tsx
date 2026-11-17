import type { Metadata } from "next";
import { SizeGuideTable, type SizeGuideData } from "@/components/product/size-guide";
import { Breadcrumbs } from "@/components/shop/shop-view";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Size guide", description: "Kinder Thread size guide for ages 0–5 with height and chest measurements.", alternates: { canonical: "/size-guide" } };

export default async function SizeGuidePage() {
  const guides = await db.sizeGuide.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
  return (
    <div className="container-kt max-w-4xl py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Size guide" }]} />
      <h1 className="display-lg mt-6">Size guide</h1>
      <p className="mt-4 max-w-2xl text-cocoa-500">Our sizes follow your child&apos;s age, but every little one grows differently — use height as your best guide. Between sizes? Choose the larger one.</p>
      {guides.length === 0 && <p className="mt-10 text-cocoa-500">Size charts will be published soon.</p>}
      {guides.map((g) => (
        <section key={g.id} className="mt-12">
          <h2 className="font-display text-2xl">{g.name}</h2>
          <div className="mt-5 rounded-sm bg-cream-100 p-5 md:p-6">
            <SizeGuideTable guide={{ name: g.name, unit: g.unit, rows: g.rows as SizeGuideData["rows"], notes: g.notes }} />
          </div>
          {g.notes && <p className="mt-3 text-[0.82rem] text-cocoa-500">{g.notes}</p>}
        </section>
      ))}
    </div>
  );
}
