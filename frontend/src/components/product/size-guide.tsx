"use client";

import Link from "next/link";
import { ArrowRight, Ruler } from "lucide-react";
import { useState } from "react";
import { FitFinder, MeasureGuide, SizeChart, SizeGuideProvider, UnitToggle } from "@/components/size-guide/explorer";
import { Drawer } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";

export type SizeGuideData = { name: string; unit: string; rows: { size: string; age?: string; height?: string; chest?: string; waist?: string; length?: string }[]; notes: string | null };

/**
 * "Size guide" on the product page: a side panel with this piece's sizes (the chosen one
 * marked), a height-based fit finder that can pick the size, and how to measure.
 */
export function SizeGuideButton({ guide, highlight, onChoose }: { guide: SizeGuideData | null; highlight?: string | null; onChoose?: (size: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chart" | "measure">("chart");
  if (!guide || !guide.rows.length) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-sage-700 hover:underline">
        <Ruler className="h-4 w-4" /> Size guide
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Size guide"
        className="max-w-[500px] bg-cream-50"
        footer={
          <Link href="/size-guide" className="flex items-center justify-between text-[0.88rem] font-semibold text-cocoa hover:text-sage-700">
            Full size guide &amp; fit tips
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <SizeGuideProvider guide={guide}>
          <div className="px-5 pt-5 pb-8 sm:px-6">
            <div role="tablist" aria-label="Size guide" className="grid grid-cols-2 rounded-full bg-cream-100 p-1">
              {(
                [
                  ["chart", "Size chart"],
                  ["measure", "How to measure"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn("h-10 rounded-full text-[0.86rem] font-semibold transition-colors", tab === id ? "bg-white text-cocoa shadow-[0_6px_16px_-10px_rgb(20_16_12/0.45)]" : "text-cocoa-500 hover:text-cocoa")}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "chart" ? (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[0.82rem] leading-snug text-cocoa-500">Sizes for this piece, measured on the child.</p>
                  <UnitToggle />
                </div>
                <SizeChart compact showGroups={false} highlight={highlight} />
                <FitFinder
                  variant="compact"
                  className="mt-5"
                  onChoose={
                    onChoose
                      ? (s) => {
                          onChoose(s);
                          setOpen(false);
                        }
                      : undefined
                  }
                />
                <p className="mt-4 text-[0.78rem] leading-relaxed text-cocoa-400">
                  Length is the back length of the top. Between sizes? Choose the larger one.
                  {guide.notes && <span className="block">{guide.notes}</span>}
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <MeasureGuide compact />
              </div>
            )}
          </div>
        </SizeGuideProvider>
      </Drawer>
    </>
  );
}
