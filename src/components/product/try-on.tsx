"use client";

import Link from "next/link";
import { ScanFace } from "lucide-react";
import { useState } from "react";
import { NewsletterForm } from "@/components/home/newsletter";
import { Modal } from "@/components/ui/overlay";

/**
 * Honest, future-ready entry point for virtual try-on. No fake preview —
 * it explains what is planned and lets parents opt in to hear about it.
 */
export function TryOnTeaser() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-cocoa-600 hover:text-cocoa">
        <ScanFace className="h-4 w-4" /> Virtual try-on <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[0.62rem] font-bold tracking-wider text-sun-700 uppercase">Coming later</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Virtual try-on is on its way">
        <div className="space-y-4 text-[0.95rem] leading-relaxed text-cocoa-600">
          <p>We&apos;re working on a way to preview size and fit before you buy — without ever asking you to upload photos of your child.</p>
          <ul className="space-y-2 rounded-2xl bg-cream-100 p-4 text-[0.88rem]">
            <li>✦ 3D garment views of each style</li>
            <li>✦ An age-based fit preview to help choose the right size</li>
            <li>✦ Privacy first: nothing about your little one is stored</li>
          </ul>
          <p>Until then, our size guide and team on WhatsApp are happy to help.</p>
          <div>
            <p className="mb-2 text-sm font-bold text-cocoa">Tell me when it&apos;s ready</p>
            <NewsletterForm source="TRYON" tone="light" cta="Notify me" />
          </div>
          <Link href="/try-on" className="text-sm font-bold text-sage-700 hover:underline" onClick={() => setOpen(false)}>
            Read about our plans
          </Link>
        </div>
      </Modal>
    </>
  );
}
