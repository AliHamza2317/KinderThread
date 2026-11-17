"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; image: string | null; description: string | null; count: number };

const TONES = ["bg-sage-100", "bg-coral-100", "bg-bear-100", "bg-sun-100"];

function TiltTile({ cat, index }: { cat: Cat; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  const sample = cat.image?.startsWith("/samples/");
  return (
    <Link
      ref={ref}
      href={`/collections/${cat.slug}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("group block [perspective:900px]", index % 2 === 1 && "lg:mt-16")}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] transition-transform duration-500 ease-[var(--ease-soft)] [transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))] [transform-style:preserve-3d]">
        <div className={cn("absolute inset-0", TONES[index % TONES.length])} />
        {cat.image && (
          <Image src={cat.image} alt="" fill sizes="(min-width: 1024px) 24vw, 46vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.06]" />
        )}
        {sample && <span className="absolute top-3 left-3 rounded-full bg-cream-50/90 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.14em] text-cocoa-600 uppercase">Sample image</span>}
        <span className="absolute right-3 bottom-3 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-cream-50 text-cocoa opacity-0 shadow-soft transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3 px-1">
        <h3 className="font-display text-[1.45rem] leading-tight md:text-[1.7rem]">{cat.name}</h3>
        <span className="text-[0.8rem] font-semibold text-cocoa-400">{cat.count} styles</span>
      </div>
    </Link>
  );
}

export function FeaturedCategories({ categories }: { categories: Cat[] }) {
  return (
    <Reveal stagger={0.1} className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
      {categories.map((c, i) => (
        <TiltTile key={c.id} cat={c} index={i} />
      ))}
    </Reveal>
  );
}
