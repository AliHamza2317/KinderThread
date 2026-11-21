"use client";

import { useMemo, useState } from "react";
import { sortSizes } from "@/lib/sizes";

type V = { id: string; size: string; colorId: string | null; stock: number; price: number; sku: string };
type Color = { id: string; name: string; hex: string };

export function useVariantSelection(variants: V[], colors: Color[], initialColorId?: string | null) {
  const [colorId, setColorId] = useState<string | null>(() => {
    if (initialColorId) return initialColorId;
    // prefer the first colour that has stock
    const inStock = colors.find((c) => variants.some((v) => v.colorId === c.id && v.stock > 0));
    return inStock?.id ?? colors[0]?.id ?? null;
  });
  const [size, setSize] = useState<string | null>(null);

  const sizes = useMemo(() => sortSizes([...new Set(variants.map((v) => v.size))]), [variants]);
  const forColor = useMemo(() => variants.filter((v) => !colors.length || v.colorId === colorId), [variants, colors.length, colorId]);
  const stockFor = (s: string) => forColor.find((v) => v.size === s)?.stock ?? 0;
  const selected = size ? forColor.find((v) => v.size === size) ?? null : null;
  const colorHasStock = (cid: string) => variants.some((v) => v.colorId === cid && v.stock > 0);

  return {
    colorId,
    setColorId: (id: string) => {
      setColorId(id);
      // keep the size if it exists for the new colour
      if (size && !variants.some((v) => v.colorId === id && v.size === size)) setSize(null);
    },
    size,
    setSize,
    sizes,
    stockFor,
    selected,
    colorHasStock,
    color: colors.find((c) => c.id === colorId) ?? null,
  };
}
