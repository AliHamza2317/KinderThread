"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveStockAction } from "@/actions/admin/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { toast } from "@/stores/toast";

export type InventoryRow = {
  id: string;
  productId: string;
  productName: string;
  productStatus: string;
  isSample: boolean;
  color: string | null;
  colorHex: string | null;
  size: string;
  sku: string;
  stock: number;
  isActive: boolean;
};

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const changed = useMemo(
    () =>
      Object.entries(edits)
        .filter(([id, v]) => v !== "" && Number(v) !== rows.find((r) => r.id === id)?.stock)
        .map(([id, v]) => ({ id, stock: Math.max(0, Math.floor(Number(v))) })),
    [edits, rows],
  );

  const save = () =>
    start(async () => {
      const res = await saveStockAction(changed);
      if (!res) return;
      if (res.ok) {
        toast({ title: res.message ?? "Stock updated" });
        setEdits({});
        router.refresh();
      } else toast({ title: "Couldn't save stock", description: res.message, tone: "error" });
    });

  return (
    <>
      <div className="-mx-5 overflow-x-auto md:mx-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-[0.72rem] font-bold tracking-wider text-cocoa-500 uppercase">
              <th className="border-b border-cocoa-100 px-3 py-2.5">Product</th>
              <th className="border-b border-cocoa-100 px-3 py-2.5">Variant</th>
              <th className="border-b border-cocoa-100 px-3 py-2.5">SKU</th>
              <th className="w-32 border-b border-cocoa-100 px-3 py-2.5 text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const value = edits[r.id] ?? String(r.stock);
              const n = Number(value);
              const isChanged = edits[r.id] !== undefined && edits[r.id] !== "" && n !== r.stock;
              return (
                <tr key={r.id} className={cn("hover:bg-cream-100/60", isChanged && "bg-sun-50")}>
                  <td className="border-b border-cocoa-50 px-3 py-2.5">
                    <Link href={`/admin/products/${r.productId}`} className="font-semibold hover:underline">
                      {r.productName}
                    </Link>
                    <span className="mt-1 flex gap-1">
                      {r.productStatus !== "ACTIVE" && <Badge tone="neutral">{r.productStatus.toLowerCase()}</Badge>}
                      {!r.isActive && <Badge tone="out">variant off</Badge>}
                      {r.isSample && <Badge tone="sample">Sample</Badge>}
                    </span>
                  </td>
                  <td className="border-b border-cocoa-50 px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      {r.colorHex && <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: r.colorHex }} />}
                      {[r.color, r.size].filter(Boolean).join(" · ")}
                    </span>
                  </td>
                  <td className="border-b border-cocoa-50 px-3 py-2.5 font-mono text-xs text-cocoa-500">{r.sku}</td>
                  <td className="border-b border-cocoa-50 px-3 py-2">
                    <Input
                      inputMode="numeric"
                      className={cn("ml-auto h-10 w-24 rounded-xl text-right tabular-nums", n <= 0 ? "text-coral-700" : n <= 3 ? "text-sun-700" : "")}
                      value={value}
                      aria-label={`Stock for ${r.productName} ${r.color ?? ""} ${r.size}`}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-0 mt-4 flex items-center justify-between gap-3 border-t border-cocoa-100 bg-[#f6f5f2]/95 py-3 backdrop-blur">
        <p className="text-sm text-cocoa-500">{changed.length ? `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}` : "Edit stock values, then save."}</p>
        <div className="flex gap-2">
          {changed.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setEdits({})} disabled={pending}>
              Discard
            </Button>
          )}
          <Button size="sm" onClick={save} loading={pending} disabled={!changed.length}>
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}
