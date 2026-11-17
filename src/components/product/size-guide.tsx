"use client";

import { Ruler } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/overlay";

export type SizeGuideData = { name: string; unit: string; rows: { size: string; age?: string; height?: string; chest?: string; waist?: string; length?: string }[]; notes: string | null };

export function SizeGuideTable({ guide, highlight }: { guide: SizeGuideData; highlight?: string | null }) {
  const cols = (["age", "height", "chest", "waist", "length"] as const).filter((c) => guide.rows.some((r) => r[c]));
  const label: Record<string, string> = { age: "Age", height: `Height (${guide.unit})`, chest: `Chest (${guide.unit})`, waist: `Waist (${guide.unit})`, length: `Length (${guide.unit})` };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-cocoa-100 text-[0.72rem] tracking-wider text-cocoa-500 uppercase">
            <th className="py-2.5 pr-3 font-bold">Size</th>
            {cols.map((c) => (
              <th key={c} className="py-2.5 pr-3 font-bold">
                {label[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guide.rows.map((r) => (
            <tr key={r.size} className={r.size === highlight ? "bg-sun-50 font-semibold" : "border-b border-cocoa-50"}>
              <td className="py-2.5 pr-3 font-bold">{r.size}</td>
              {cols.map((c) => (
                <td key={c} className="py-2.5 pr-3 text-cocoa-600">
                  {r[c] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuideButton({ guide, highlight }: { guide: SizeGuideData | null; highlight?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!guide || !guide.rows.length) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-sage-700 hover:underline">
        <Ruler className="h-4 w-4" /> Size guide
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Size guide" className="sm:max-w-2xl">
        <p className="mb-4 text-sm text-cocoa-500">{guide.name}. Measurements are of the child, not the garment, unless noted.</p>
        <SizeGuideTable guide={guide} highlight={highlight} />
        <div className="mt-5 grid gap-3 rounded-2xl bg-cream-100 p-4 text-[0.85rem] text-cocoa-600 sm:grid-cols-3">
          <p>
            <strong className="block text-cocoa">Height</strong>Measure from the top of the head to the heels, standing or lying flat.
          </p>
          <p>
            <strong className="block text-cocoa">Chest</strong>Measure around the fullest part of the chest, under the arms.
          </p>
          <p>
            <strong className="block text-cocoa">Between sizes?</strong>Choose the larger size — little ones grow fast.
          </p>
        </div>
        {guide.notes && <p className="mt-4 text-[0.8rem] text-cocoa-500">{guide.notes}</p>}
      </Modal>
    </>
  );
}
