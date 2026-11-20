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
 * Full-width photo banner at the top of collection and listing pages (as Pakistani
 * kidswear stores open a collection): the photo edge to edge, a soft shade and the
 * breadcrumb, label and title over it. Use *word* in the title for the italic accent.
 */
export function PageBanner({
  image,
  imageAlt = "",
  position,
  eyebrow,
  title,
  description,
  breadcrumb,
  children,
}: {
  image: string;
  imageAlt?: string;
  position?: string;
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumb?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-cocoa-800">
      <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-10 object-cover" style={{ objectPosition: position ?? "50% 50%" }} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-cocoa-900/75 via-cocoa-900/35 to-cocoa-900/10 lg:bg-gradient-to-r lg:from-cocoa-900/70 lg:via-cocoa-900/30 lg:to-cocoa-900/5" />
      <div className="container-kt flex min-h-[15rem] items-end py-8 text-cream-50 sm:min-h-[18rem] lg:min-h-[20rem] lg:items-center lg:py-12 [&_.text-sage-700]:text-sun-200">
        <div className="max-w-xl">
          {breadcrumb && <Breadcrumbs items={breadcrumb} className="mb-4 text-cream-100/75 [&_a:hover]:text-cream-50 [&_[aria-current]]:text-cream-50 [&_span[aria-hidden]]:text-cream-100/45" />}
          {eyebrow && <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-cream-100/90 uppercase">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-[clamp(2.2rem,1.2rem+2.8vw,3.8rem)] leading-[1] font-medium tracking-[-0.045em]">
            <SplitWords text={title} />
          </h1>
          {description && <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-cream-100/90 md:text-[1rem]">{description}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/**
 * Collection header: a calm full-width band with the breadcrumb, label and style count,
 * the title and a short line — and, on larger screens, a few crisp photos of products
 * from the collection (instead of stretching a portrait photo into a wide banner).
 */
export function CollectionHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  count,
  thumbs = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumb?: Crumb[];
  count?: number;
  thumbs?: { href: string; image: string; alt: string }[];
}) {
  return (
    <section className="border-b border-cocoa/[0.06] bg-cream-100">
      <div className="container-kt grid items-center gap-8 py-9 md:py-12 lg:grid-cols-12 lg:py-10">
        <div className={cn(thumbs.length ? "lg:col-span-6" : "lg:col-span-12")}>
          {breadcrumb && <Breadcrumbs items={breadcrumb} className="mb-5" />}
          {(eyebrow || count !== undefined) && (
            <p className="flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.2em] text-cocoa-500 uppercase">
              {eyebrow}
              {eyebrow && count !== undefined && <span aria-hidden className="h-1 w-1 rounded-full bg-coral-400" />}
              {count !== undefined && `${count} ${count === 1 ? "style" : "styles"}`}
            </p>
          )}
          <h1 className="mt-3 font-display text-[clamp(2.3rem,1.3rem+2.8vw,3.9rem)] leading-[1] font-medium tracking-[-0.045em]">
            <SplitWords text={title} />
          </h1>
          {description && <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-cocoa-500">{description}</p>}
        </div>
        {thumbs.length > 0 && (
          <ul className="hidden justify-end gap-3 lg:col-span-6 lg:flex xl:gap-4" aria-label="From this collection">
            {thumbs.slice(0, 3).map((t) => (
              <li key={t.href} className="w-[min(30%,10.5rem)]">
                <Link href={t.href} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-cream-200 shadow-[0_18px_40px_-26px_rgb(20_16_12/0.45)]">
                  <Image src={t.image} alt={t.alt} fill sizes="170px" className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.05]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * Inner-page header: a full-width soft band with the breadcrumb and a centred title
 * (or, when a photograph is given, the full-width photo banner).
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
      <PageBanner image={image} imageAlt={imageAlt} eyebrow={eyebrow} title={title} description={description} breadcrumb={breadcrumb}>
        {children}
      </PageBanner>
    );
  }
  return (
    <section className="border-b border-cocoa/[0.06] bg-cream-100">
      <div className={cn("container-kt text-center", size === "sm" ? "py-9 md:py-12" : "py-10 md:py-16")}>
        {breadcrumb && <Breadcrumbs items={breadcrumb} align="center" className="mb-4" />}
        {eyebrow && <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-cocoa-500 uppercase">{eyebrow}</p>}
        <h1 className="mx-auto mt-2 max-w-4xl font-display text-[clamp(2rem,1.3rem+2.2vw,3.4rem)] leading-[1.02] font-medium tracking-[-0.04em]">
          <SplitWords text={title} />
        </h1>
        {description && <p className="mx-auto mt-3 max-w-xl text-[0.98rem] leading-relaxed text-cocoa-500">{description}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

/** Round photo links to every collection (as Baby Planet shows categories); scrolls sideways on phones. */
export function CollectionCircles({ items, label = "Collections", className }: { items: { label: string; href: string; image?: string | null; active?: boolean }[]; label?: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("container-kt", className)}>
      <ul className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 pt-1 pb-1 md:mx-0 md:gap-5 md:px-0 lg:justify-center">
        {items.map((it) => (
          <li key={it.href} className="shrink-0">
            <Link href={it.href} aria-current={it.active ? "page" : undefined} className="group flex w-[4.75rem] flex-col items-center text-center md:w-[5.5rem]">
              <span
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-full bg-cream-200 ring-offset-2 ring-offset-cream-50 transition-[box-shadow]",
                  it.active ? "ring-2 ring-cocoa" : "ring-1 ring-cocoa/10 group-hover:ring-2 group-hover:ring-sage-500",
                )}
              >
                {it.image && <Image src={it.image} alt="" fill sizes="88px" className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.08]" />}
              </span>
              <span className={cn("mt-2 text-[0.72rem] leading-tight md:text-[0.78rem]", it.active ? "font-semibold text-cocoa" : "font-medium text-cocoa-600 group-hover:text-cocoa")}>{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
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
