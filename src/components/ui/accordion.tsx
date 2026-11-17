import { Plus } from "lucide-react";
import type { ReactNode } from "react";

/** Native <details> accordion — accessible and works without JavaScript. */
export function AccordionItem({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-cocoa-100" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[0.95rem] font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <Plus className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-[0.93rem] leading-relaxed text-cocoa-600">{children}</div>
    </details>
  );
}
