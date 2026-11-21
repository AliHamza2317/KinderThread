import Image from "next/image";
import Link from "next/link";
import { CenteredHeading } from "./centered-heading";

export type AgeCircle = { label: string; href: string; image: string };

/** "Shop by age" as round photos with a label under each (the circle style used by Baby Planet). */
export function AgeCircles({ items }: { items: AgeCircle[] }) {
  return (
    <section className="container-kt" aria-labelledby="age-heading">
      <CenteredHeading id="age-heading" title="Shop by *age*" />
      <ul className="mx-auto grid max-w-4xl grid-cols-4 gap-3 sm:gap-6 md:gap-10">
        {items.map((a) => (
          <li key={a.href}>
            <Link href={a.href} className="group flex flex-col items-center text-center">
              <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-cream-200 ring-2 ring-sage-200 ring-offset-2 ring-offset-cream-50 transition-[box-shadow] duration-300 group-hover:ring-sage-500 sm:ring-offset-4">
                <Image src={a.image} alt="" fill sizes="(min-width: 768px) 180px, 22vw" className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.06]" />
              </span>
              <span className="mt-3 text-[0.8rem] font-semibold text-cocoa sm:text-[0.95rem]">{a.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
