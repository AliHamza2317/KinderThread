import Image from "next/image";
import { ArrowDown } from "lucide-react";
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

export type CollectionTone = "sage" | "coral" | "sun" | "cream" | "cocoa" | "forest";

const COLLECTION_TONES: Record<CollectionTone, { bg: string; glow: string; text: string; muted: string; accent: string; chip: string; dark: boolean }> = {
  sage: { bg: "bg-sage-100", glow: "bg-sage-200/70", text: "text-cocoa", muted: "text-cocoa-500", accent: "", chip: "border-cocoa/10 bg-cream-50/70", dark: false },
  coral: { bg: "bg-coral-100", glow: "bg-coral-200/60", text: "text-cocoa", muted: "text-cocoa-500", accent: "[&_.text-sage-700]:text-coral-700", chip: "border-cocoa/10 bg-cream-50/70", dark: false },
  sun: { bg: "bg-sun-100", glow: "bg-sun-200/70", text: "text-cocoa", muted: "text-cocoa-500", accent: "[&_.text-sage-700]:text-sun-700", chip: "border-cocoa/10 bg-cream-50/70", dark: false },
  cream: { bg: "bg-cream-200", glow: "bg-cream-300/70", text: "text-cocoa", muted: "text-cocoa-500", accent: "", chip: "border-cocoa/10 bg-cream-50/70", dark: false },
  cocoa: { bg: "bg-cocoa", glow: "bg-cocoa-600/50", text: "text-cream-50", muted: "text-cream-200/80", accent: "[&_.text-sage-700]:text-sun-200", chip: "border-cream-50/15 bg-cream-50/10", dark: true },
  forest: { bg: "bg-sage-700", glow: "bg-sage-600/60", text: "text-cream-50", muted: "text-cream-100/80", accent: "[&_.text-sage-700]:text-sun-200", chip: "border-cream-50/15 bg-cream-50/10", dark: true },
};

type CollagePhoto = { href?: string; image: string; alt: string; name?: string; price?: string };

/**
 * Collection header in an editorial style: a tinted band with the breadcrumb, label,
 * a large title, a short line, small facts (styles, sizes, cash on delivery) and a
 * button to the products — and a photo collage (the collection photograph plus two
 * products with name and price). Photos keep their own proportions, so nothing is
 * stretched into a wide banner.
 */
export function CollectionHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  tone = "cream",
  facts = [],
  feature,
  products = [],
  ctaHref = "#products",
  mobileBanner,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumb?: Crumb[];
  tone?: CollectionTone;
  facts?: string[];
  feature?: CollagePhoto | null;
  products?: CollagePhoto[];
  ctaHref?: string;
  /** phones: show the full-width photo banner instead (title over the photo) */
  mobileBanner?: { image: string; position?: string } | null;
}) {
  const t = COLLECTION_TONES[tone];
  const photos = [feature, ...products].filter(Boolean) as CollagePhoto[];
  const [big, ...small] = photos.slice(0, 3);
  return (
    <>
      {mobileBanner && (
        <div className="md:hidden">
          <PageBanner image={mobileBanner.image} position={mobileBanner.position} eyebrow={eyebrow} title={title} description={description} breadcrumb={breadcrumb} />
        </div>
      )}
      <section className={cn("relative isolate overflow-hidden", mobileBanner && "max-md:hidden", t.bg, t.text)}>
        {/* soft light behind the collage */}
        <div aria-hidden className={cn("pointer-events-none absolute -z-10 aspect-square w-[46rem] rounded-full blur-3xl max-lg:hidden", t.glow, "top-1/2 right-[-6rem] -translate-y-1/2")} />
        <div className="container-kt grid items-center gap-6 py-8 md:gap-8 md:py-12 lg:grid-cols-12 lg:gap-12 lg:py-14">
          <div className={cn("lg:col-span-6", t.accent)}>
            {breadcrumb && (
              <Breadcrumbs
                items={breadcrumb}
                className={cn("mb-5 md:mb-6", t.dark && "text-cream-200/70 [&_a:hover]:text-cream-50 [&_[aria-current]]:text-cream-50 [&_span[aria-hidden]]:text-cream-200/40")}
              />
            )}
            {eyebrow && <p className={cn("eyebrow eyebrow-rule", t.muted)}>{eyebrow}</p>}
            <h1 className="mt-4 font-display text-[clamp(2.8rem,1.4rem+4vw,5.4rem)] leading-[0.95] font-medium tracking-[-0.055em]">
              <SplitWords text={title} />
            </h1>
            {description && <p className={cn("mt-4 max-w-md text-[0.98rem] leading-relaxed md:mt-5 md:text-[1.05rem]", t.muted)}>{description}</p>}
            {facts.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2 md:mt-6">
                {facts.map((f) => (
                  <li key={f} className={cn("rounded-full border px-3.5 py-1.5 text-[0.78rem] font-semibold", t.chip)}>
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <a
              href={ctaHref}
              className={cn(
                "group mt-8 hidden h-12 items-center gap-2 rounded-full pr-1.5 pl-6 text-[0.8rem] font-semibold tracking-[0.14em] uppercase transition-colors sm:inline-flex",
                t.dark ? "bg-cream-50 text-cocoa hover:bg-sun-200" : "bg-cocoa text-cream-50 hover:bg-sage-700",
              )}
            >
              Shop the collection
              <span className={cn("grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 group-hover:translate-y-0.5", t.dark ? "bg-cocoa text-cream-50" : "bg-cream-50 text-cocoa")}>
                <ArrowDown className="h-4 w-4" />
              </span>
            </a>
          </div>

          {big && (
            <div className="lg:col-span-6">
              <div className={cn("grid h-[13rem] gap-2.5 sm:h-[20rem] md:gap-3 lg:h-[26rem]", small.length ? "grid-cols-5 grid-rows-2" : "grid-cols-1")}>
                <CollageTile photo={big} className={cn(small.length ? "col-span-3 row-span-2" : "")} sizes="(min-width: 1024px) 26vw, 60vw" priority />
                {small.map((p, i) => (
                  <CollageTile key={p.image + i} photo={p} className={cn("col-span-2", small.length === 1 && "row-span-2")} sizes="(min-width: 1024px) 18vw, 40vw" caption />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CollageTile({ photo, className, sizes, priority, caption }: { photo: CollagePhoto; className?: string; sizes: string; priority?: boolean; caption?: boolean }) {
  const inner = (
    <>
      <Image src={photo.image} alt={photo.alt} fill priority={priority} sizes={sizes} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.05]" />
      {caption && photo.name && (
        <span className="absolute inset-x-2 bottom-2 hidden items-center justify-between gap-2 rounded-full bg-cream-50/90 py-1.5 pr-1.5 pl-3 text-cocoa backdrop-blur-md sm:flex">
          <span className="min-w-0 truncate text-[0.74rem] font-semibold">{photo.name}</span>
          {photo.price && <span className="shrink-0 rounded-full bg-cocoa px-2 py-0.5 text-[0.68rem] font-semibold text-cream-50">{photo.price}</span>}
        </span>
      )}
    </>
  );
  const cls = cn("group relative block overflow-hidden rounded-[1.25rem] bg-cream-200 shadow-[0_24px_50px_-30px_rgb(20_16_12/0.55)] md:rounded-[1.5rem]", className);
  return photo.href ? (
    <Link href={photo.href} className={cls} aria-label={photo.name ?? photo.alt}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
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
