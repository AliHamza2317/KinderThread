"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Price } from "@/components/ui/price";
import { Reveal } from "@/components/ui/reveal";
import type { GarmentKind } from "@/lib/garment-paths";
import { detectDeviceTier, type DeviceTier } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const WardrobeScene = dynamic(() => import("@/components/three/wardrobe-scene"), { ssr: false });

export type WardrobeCategory = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  garment: GarmentKind;
  products: { id: string; slug: string; name: string; price: number; compareAtPrice: number | null; image: string | null; colors: { name: string; hex: string }[] }[];
};

const FALLBACK = ["#8a9e72", "#f4a88c", "#f1e6d0", "#f7cd6b"];

export function Wardrobe({ categories }: { categories: WardrobeCategory[] }) {
  const section = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [rotateNonce, setRotateNonce] = useState(0);
  // chosen colour per category (defaults to first product's first colour)
  const [colors, setColors] = useState<Record<string, { productId: string; hex: string; name: string } | undefined>>({});

  useEffect(() => setTier(detectDeviceTier()), []);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    const openIo = new IntersectionObserver(([e]) => e.isIntersecting && setOpen(true), { threshold: 0.45 });
    io.observe(el);
    openIo.observe(el);
    return () => {
      io.disconnect();
      openIo.disconnect();
    };
  }, []);

  const slots = categories.map((c, i) => {
    const chosen = colors[c.slug];
    const hex = chosen?.hex ?? c.products[0]?.colors[0]?.hex ?? FALLBACK[i % FALLBACK.length];
    return { key: c.slug, garment: c.garment, color: hex };
  });
  const cat = categories[selected];
  const canvas = tier === "full" || tier === "lite";

  return (
    <div ref={section} className="grid items-center gap-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Reveal>
          <p className="eyebrow eyebrow-rule">Interactive</p>
        </Reveal>
        <h2 className="display-lg mt-4">The Little Wardrobe</h2>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-cocoa-500">
            Open the doors, pick a hanger and try the colours. Every colour you tap is a real option in our collection.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Wardrobe categories">
          {categories.map((c, i) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-full px-4 py-2.5 text-[0.88rem] font-bold transition",
                i === selected ? "bg-cocoa text-cream-50" : "border border-cocoa-100 text-cocoa-600 hover:border-cocoa",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {cat && (
          <div className="mt-8" role="tabpanel" aria-label={cat.name}>
            {cat.description && <p className="text-[0.95rem] text-cocoa-500">{cat.description}</p>}
            <ul className="mt-5 divide-y divide-cocoa-100 border-y border-cocoa-100">
              {cat.products.slice(0, 3).map((p) => {
                const active = colors[cat.slug]?.productId === p.id;
                return (
                  <li key={p.id} className="flex items-center gap-4 py-3.5">
                    <Link href={`/products/${p.slug}`} className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                      {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${p.slug}`} className="block truncate text-[0.92rem] font-semibold hover:underline">
                        {p.name}
                      </Link>
                      <Price price={p.price} compareAt={p.compareAtPrice} size="sm" />
                    </div>
                    <div className="flex gap-1.5" role="group" aria-label={`${p.name} colours`}>
                      {p.colors.map((c) => {
                        const on = active && colors[cat.slug]?.hex === c.hex;
                        return (
                          <button
                            key={c.name}
                            onClick={() => setColors((s) => ({ ...s, [cat.slug]: { productId: p.id, hex: c.hex, name: c.name } }))}
                            className={cn("h-7 w-7 rounded-full ring-1 ring-black/10 transition hover:scale-110", on && "ring-2 ring-cocoa ring-offset-2 ring-offset-cream")}
                            style={{ background: c.hex }}
                            aria-label={`Show ${p.name} in ${c.name}`}
                            aria-pressed={on}
                          />
                        );
                      })}
                    </div>
                  </li>
                );
              })}
              {cat.products.length === 0 && <li className="py-4 text-sm text-cocoa-500">New styles for this category are on their way.</li>}
            </ul>
            <Link href={`/collections/${cat.slug}`} className="group mt-6 inline-flex items-center gap-2 text-[0.92rem] font-bold">
              <span className="link-underline">Shop {cat.name}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      <div className="relative lg:col-span-7">
        <div className="relative aspect-[1.15/1] overflow-hidden rounded-[2rem] bg-cream-100">
          {canvas && near ? (
            <WardrobeScene slots={slots} selected={selected} onSelect={setSelected} open={open} active={visible} rotateNonce={rotateNonce} tier={tier} />
          ) : (
            cat?.image && <Image src={cat.image} alt="" fill sizes="(min-width: 1024px) 55vw, 95vw" className="object-cover" />
          )}
          {canvas && (
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button onClick={() => setRotateNonce((n) => (n > 0 ? -1 : n - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/90 text-cocoa shadow-soft hover:bg-white" aria-label="Rotate wardrobe left">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={() => setRotateNonce((n) => (n < 0 ? 1 : n + 1))} className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/90 text-cocoa shadow-soft hover:bg-white" aria-label="Rotate wardrobe right">
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <p className="mt-3 text-[0.75rem] text-cocoa-400">
          {canvas ? "Drag to look around · tap a hanger to choose. " : ""}Garments shown are illustrative silhouettes, not exact product replicas — see each product&apos;s photos for the real item.
        </p>
      </div>
    </div>
  );
}
