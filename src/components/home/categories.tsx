import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; image: string | null; description: string | null; count: number };

export function FeaturedCategories({ categories }: { categories: Cat[] }) {
  return (
    <Reveal stagger={0.1} className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
      {categories.map((cat, i) => (
        <Link key={cat.id} href={`/collections/${cat.slug}`} className={cn("group block", i % 2 === 1 && "lg:mt-14")}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-200">
            {cat.image && (
              <Image src={cat.image} alt="" fill sizes="(min-width: 1024px) 24vw, 48vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-[1.05]" />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-[1.35rem] leading-tight md:text-[1.6rem]">{cat.name}</h3>
            <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 opacity-50 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" strokeWidth={1.6} />
          </div>
          <p className="mt-1 text-[0.72rem] font-bold tracking-[0.14em] text-cocoa-400 uppercase">{cat.count} styles</p>
        </Link>
      ))}
    </Reveal>
  );
}
