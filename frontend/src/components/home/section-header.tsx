import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal, SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeader({ id, eyebrow, title, body, link, align = "left", className, children }: { id?: string; eyebrow?: string; title: string; body?: string; link?: { href: string; label: string }; align?: "left" | "center"; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 md:mb-14", align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between", className)}>
      <div className={cn("max-w-2xl", align === "center" && "flex flex-col items-center")}>
        {eyebrow && (
          <Reveal>
            <p className="eyebrow eyebrow-rule">{eyebrow}</p>
          </Reveal>
        )}
        <h2 id={id} className="display-lg mt-4">
          <SplitWords text={title} />
        </h2>
        {body && (
          <Reveal delay={0.15}>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-cocoa-500">{body}</p>
          </Reveal>
        )}
      </div>
      {(link || children) && (
        <Reveal delay={0.2} className="flex shrink-0 items-center gap-5">
          {link && (
            <Link href={link.href} className="group inline-flex items-center gap-2 text-[0.9rem] font-semibold text-cocoa">
              <span className="link-underline">{link.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-cocoa text-cream-50 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          )}
          {children}
        </Reveal>
      )}
    </div>
  );
}

export const isSampleAsset = (url?: string | null) => !!url && url.startsWith("/samples/");
