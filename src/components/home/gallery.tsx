import Image from "next/image";
import { InstagramIcon } from "@/components/ui/social-icons";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type G = { id: string; url: string; alt: string; href: string | null; isSample: boolean };

export function Gallery({ images, instagram }: { images: G[]; instagram: string }) {
  if (!images.length) return null;
  const anySample = images.some((g) => g.isSample);
  return (
    <>
      <Reveal stagger={0.06} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {images.slice(0, 8).map((g, i) => {
          const href = g.href || instagram;
          const tile = (
            <div className={cn("group relative aspect-square overflow-hidden rounded-[1.25rem] bg-cream-200", i === 0 && "md:col-span-2 md:row-span-2 md:aspect-auto md:h-full")}>
              <Image src={g.url} alt={g.alt} fill sizes={i === 0 ? "(min-width: 768px) 50vw, 50vw" : "(min-width: 768px) 25vw, 50vw"} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105" />
              {href && (
                <span className="absolute inset-0 grid place-items-center bg-cocoa-900/0 text-cream-50 opacity-0 transition duration-500 group-hover:bg-cocoa-900/25 group-hover:opacity-100">
                  <InstagramIcon width={28} height={28} />
                </span>
              )}
            </div>
          );
          return href ? (
            <a key={g.id} href={href} target="_blank" rel="noopener noreferrer" className={cn(i === 0 && "md:col-span-2 md:row-span-2")} aria-label={`${g.alt} — open Instagram`}>
              {tile}
            </a>
          ) : (
            <div key={g.id} className={cn(i === 0 && "md:col-span-2 md:row-span-2")}>
              {tile}
            </div>
          );
        })}
      </Reveal>
      {anySample && <p className="mt-4 text-[0.72rem] font-semibold tracking-[0.12em] text-cocoa-400 uppercase">Sample imagery — your Instagram photos will appear here</p>}
    </>
  );
}
