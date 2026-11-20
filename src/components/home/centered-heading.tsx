import { SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/** Centred section title with a short line under it, as on Pakistani store homepages. */
export function CenteredHeading({ title, body, id, className }: { title: string; body?: string; id?: string; className?: string }) {
  return (
    <div className={cn("mb-7 text-center md:mb-10", className)}>
      <h2 id={id} className="font-display text-[clamp(1.75rem,1.2rem+1.6vw,2.6rem)] leading-[1.05] font-medium tracking-[-0.035em]">
        <SplitWords text={title} />
      </h2>
      {body && <p className="mx-auto mt-2 max-w-md text-[0.92rem] text-cocoa-500">{body}</p>}
    </div>
  );
}
