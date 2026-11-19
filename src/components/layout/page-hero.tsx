import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Small, quiet breadcrumb trail (uppercase, letter-spaced) used across inner pages. */
export function Breadcrumbs({ items, className, align = "left" }: { items: Crumb[]; className?: string; align?: "left" | "center" }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[0.7rem] font-medium tracking-[0.14em] text-cocoa-400 uppercase", className)}>
      <ol className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", align === "center" && "justify-center")}>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-cocoa-300">/</span>}
            {it.href ? (
              <Link href={it.href} className="transition-colors hover:text-cocoa">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-cocoa-600">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Inner-page header, in the style of brand collection banners: a soft rounded band
 * with the title centred — or, when a photograph is given, text beside the photo.
 * Use *word* in the title for the serif italic accent.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  image,
  imageAlt = "",
  children,
  size = "md",
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumb?: Crumb[];
  image?: string | null;
  imageAlt?: string;
  children?: ReactNode;
  size?: "sm" | "md";
}) {
  if (image) {
    return (
      <section className="px-2.5 pt-2 md:px-4">
        <div className="grid overflow-hidden rounded-[2rem] bg-cream-100 md:rounded-[3rem] lg:grid-cols-2">
          <div className="relative order-1 aspect-[16/10] lg:order-2 lg:aspect-auto lg:min-h-[26rem]">
            <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="order-2 flex flex-col justify-center px-6 py-10 text-center md:px-14 md:py-16 lg:order-1 lg:text-left">
            {breadcrumb && <Breadcrumbs items={breadcrumb} className="mb-6 max-lg:[&_ol]:justify-center" />}
            {eyebrow && <p className="eyebrow eyebrow-rule max-lg:justify-center">{eyebrow}</p>}
            <h1 className="display-lg mt-4">
              <SplitWords text={title} />
            </h1>
            {description && <p className="mx-auto mt-4 max-w-md text-[1.02rem] leading-relaxed text-cocoa-500 lg:mx-0">{description}</p>}
            {children && <div className="mt-7">{children}</div>}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="px-2.5 pt-2 md:px-4">
      <div className={cn("rounded-[2rem] bg-cream-100 px-6 text-center md:rounded-[3rem]", size === "sm" ? "py-10 md:py-14" : "py-14 md:py-20")}>
        {breadcrumb && <Breadcrumbs items={breadcrumb} align="center" className="mb-6" />}
        {eyebrow && <p className="eyebrow eyebrow-rule justify-center">{eyebrow}</p>}
        <h1 className={cn("mx-auto mt-4 max-w-4xl", size === "sm" ? "display-md" : "display-lg")}>
          <SplitWords text={title} />
        </h1>
        {description && <p className="mx-auto mt-4 max-w-xl text-[1.02rem] leading-relaxed text-cocoa-500">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

/** Horizontal row of pill links (sub-collections, policy pages…); scrolls sideways on phones. */
export function PillNav({ items, label, className }: { items: { label: string; href: string; active?: boolean }[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("container-kt", className)}>
      <ul className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:justify-center md:px-0">
        {items.map((it) => (
          <li key={it.href} className="shrink-0">
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-[0.85rem] font-medium transition-colors",
                it.active ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa/12 bg-cream-50/60 text-cocoa-600 hover:border-cocoa hover:text-cocoa",
              )}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
