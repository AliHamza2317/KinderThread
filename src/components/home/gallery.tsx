import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

type G = { id: string; url: string; alt: string; href: string | null };

export function Gallery({ images, instagram }: { images: G[]; instagram: string }) {
  if (!images.length) return null;
  return (
    <Reveal stagger={0.05} className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      {images.slice(0, 8).map((g) => {
        const href = g.href || instagram;
        const tile = (
          <div className="group relative aspect-square overflow-hidden rounded-sm bg-cream-200">
            <Image src={g.url} alt={g.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105" />
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
    </Reveal>
  );
}
