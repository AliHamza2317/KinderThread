import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

type G = { id: string; url: string; alt: string; href: string | null };

/** Staggered photo grid (static — no scroll effects). */
export function Gallery({ images, instagram }: { images: G[]; instagram: string }) {
  if (!images.length) return null;
  const cols: G[][] = [[], [], [], []];
  images.slice(0, 8).forEach((g, i) => cols[i % 4].push(g));
  return (
    <Reveal stagger={0.05} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cols.map((col, ci) => (
        <div key={ci} className={ci % 2 ? "mt-10 flex flex-col gap-3 md:mt-16 md:gap-4" : "flex flex-col gap-3 md:gap-4"}>
          {col.map((g, gi) => {
            const href = g.href || instagram;
            const tile = (
              <div className={`group relative overflow-hidden rounded-[1.25rem] bg-cream-200 md:rounded-[1.5rem] ${(ci + gi) % 2 ? "aspect-[4/5]" : "aspect-square"}`}>
                <Image src={g.url} alt={g.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />
              </div>
            );
            return href ? (
              <a key={g.id} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${g.alt} — open Instagram`}>
                {tile}
              </a>
            ) : (
              <div key={g.id}>{tile}</div>
            );
          })}
        </div>
      ))}
    </Reveal>
  );
}
