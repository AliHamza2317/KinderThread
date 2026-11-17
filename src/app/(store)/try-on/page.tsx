import type { Metadata } from "next";
import { Box, Ruler, ShieldCheck } from "lucide-react";
import { NewsletterForm } from "@/components/home/newsletter";

export const metadata: Metadata = {
  title: "Virtual try-on (coming later)",
  description: "Our plans for a privacy-first size and fit preview for little ones.",
};

const STEPS = [
  { icon: Box, title: "3D garment views", body: "Each style captured as an accurate 3D garment you can turn and inspect, in every available colour." },
  { icon: Ruler, title: "Age-based fit preview", body: "See how a size sits on a child figure built from typical measurements for each age — to help choose between sizes." },
  { icon: ShieldCheck, title: "Privacy first", body: "No photos of your child are needed. If we ever offer photo-based try-on, it will be opt-in, processed instantly and never stored." },
];

export default function TryOnPage() {
  return (
    <div className="container-kt max-w-4xl py-14 md:py-20">
      <p className="eyebrow eyebrow-rule">In development</p>
      <h1 className="display-lg mt-4">Virtual try-on is coming later</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cocoa-500">
        We looked carefully at today&apos;s try-on technology. Most photo-based tools are trained on adults and struggle with babies and toddlers — and they would mean uploading pictures of your child. So we&apos;re building something more useful and more private, one step at a time.
      </p>
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-sm bg-cream-100 p-6">
            <Icon className="h-7 w-7 text-sage-600" strokeWidth={1.5} />
            <h2 className="mt-4 font-display text-xl">{title}</h2>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-cocoa-500">{body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-14 max-w-xl">
        <h2 className="font-display text-2xl">Be the first to try it</h2>
        <p className="mt-2 text-cocoa-500">We&apos;ll send one email when it&apos;s ready. Nothing else.</p>
        <NewsletterForm source="TRYON" tone="light" cta="Notify me" className="mt-5" />
      </div>
    </div>
  );
}
