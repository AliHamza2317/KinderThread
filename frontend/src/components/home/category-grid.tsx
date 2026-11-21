import Image from "next/image";
import Link from "next/link";
import { CenteredHeading } from "./centered-heading";

export type CategoryTile = { name: string; href: string; image: string };

/** "Shop by category": square photo tiles with the name underneath (as on Bachaa Party). */
export function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section className="container-kt" aria-labelledby="cat-grid-heading">
      <CenteredHeading id="cat-grid-heading" title="Shop by *category*" />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="group block">
              <span className="relative block aspect-square overflow-hidden rounded-[1.1rem] bg-cream-200">
                <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw" className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.05]" />
              </span>
              <span className="mt-3 block text-center text-[0.74rem] font-semibold tracking-[0.14em] text-cocoa uppercase md:text-[0.8rem]">{t.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
