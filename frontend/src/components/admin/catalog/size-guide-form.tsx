"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { saveSizeGuideAction } from "@/actions/admin/catalog";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { SIZES, SIZE_LABELS } from "@/lib/sizes";
import { toast } from "@/stores/toast";

export type SizeRow = { size: string; age: string; height: string; chest: string; waist: string; length: string };
export type SizeGuideFormData = { id: string; name: string; unit: string; notes: string | null; isDefault: boolean; rows: SizeRow[] };

const COLS: { key: keyof SizeRow; label: string; measure?: boolean }[] = [
  { key: "size", label: "Size" },
  { key: "age", label: "Age" },
  { key: "height", label: "Height", measure: true },
  { key: "chest", label: "Chest", measure: true },
  { key: "waist", label: "Waist", measure: true },
  { key: "length", label: "Length", measure: true },
];

const blankRow = (size = ""): SizeRow => ({ size, age: SIZE_LABELS[size] ?? "", height: "", chest: "", waist: "", length: "" });

export function SizeGuideForm({ guide }: { guide?: SizeGuideFormData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(guide?.name ?? "");
  const [unit, setUnit] = useState(guide?.unit === "in" ? "in" : "cm");
  const [notes, setNotes] = useState(guide?.notes ?? "");
  const [isDefault, setIsDefault] = useState(guide?.isDefault ?? false);
  const [rows, setRows] = useState<SizeRow[]>(() => (guide?.rows.length ? guide.rows : SIZES.map((s) => blankRow(s))));
  const [error, setError] = useState("");

  const patch = (i: number, k: keyof SizeRow, v: string) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const move = (i: number, d: -1 | 1) =>
    setRows((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const clean = rows.filter((r) => Object.values(r).some((v) => v.trim()));
    start(async () => {
      const res = await saveSizeGuideAction({ id: guide?.id, name, unit: unit as "cm" | "in", notes, isDefault, rows: clean });
      if (!res) return;
      if (!res.ok) {
        setError(res.message);
        toast({ title: "Couldn't save", description: res.message, tone: "error" });
        return;
      }
      toast({ title: res.message ?? "Saved" });
      if (!guide && res.data) router.push(`/admin/size-guides/${res.data.id}`);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card title="Guide details">
        <div className="grid gap-4 md:grid-cols-[1fr_160px]">
          <Field label="Name" htmlFor="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="e.g. Standard 0–5 years" />
          </Field>
          <Field label="Unit" htmlFor="unit">
            <Select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="cm">Centimetres</option>
              <option value="in">Inches</option>
            </Select>
          </Field>
          <Field label="Notes for shoppers" htmlFor="notes" optional className="md:col-span-2" hint="e.g. how to measure, or advice to size up between sizes.">
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} />
          </Field>
          <Checkbox label="Use as the default size guide for products without one" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="md:col-span-2" />
        </div>
      </Card>

      <Card title="Measurements" description={`Enter values in ${unit === "cm" ? "centimetres" : "inches"}. Ranges like 62–68 are fine. Empty rows are ignored.`}>
        <div className="-mx-5 overflow-x-auto md:mx-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="text-[0.72rem] font-bold tracking-wider text-cocoa-500 uppercase">
                {COLS.map((c) => (
                  <th key={c.key} className="px-1.5 py-2">
                    {c.label}
                    {c.measure && <span className="font-normal normal-case"> ({unit})</span>}
                  </th>
                ))}
                <th className="w-28 px-1.5 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-cocoa-50">
                  {COLS.map((c) => (
                    <td key={c.key} className="px-1.5 py-1.5">
                      <Input className="h-9 rounded-lg px-2.5" value={r[c.key]} onChange={(e) => patch(i, c.key, e.target.value)} aria-label={`${c.label} row ${i + 1}`} maxLength={c.key === "age" ? 40 : 30} />
                    </td>
                  ))}
                  <td className="px-1.5 py-1.5">
                    <div className="flex justify-end gap-0.5">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cocoa-50 disabled:opacity-30" aria-label={`Move row ${i + 1} up`}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cocoa-50 disabled:opacity-30" aria-label={`Move row ${i + 1} down`}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} className="grid h-8 w-8 place-items-center rounded-full text-coral-700 hover:bg-coral-50" aria-label={`Remove row ${i + 1}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setRows((prev) => [...prev, blankRow()])}>
          <Plus className="h-4 w-4" /> Add row
        </Button>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {error && (
          <p className="mr-auto text-sm font-medium text-coral-700" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" loading={pending}>
          {guide ? "Save size guide" : "Create size guide"}
        </Button>
      </div>
    </form>
  );
}
