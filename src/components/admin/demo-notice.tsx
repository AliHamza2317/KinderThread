import { Info } from "lucide-react";
import { DEMO_MESSAGE } from "@/lib/demo";

/** Shown after an action that would have changed data (e.g. ?demo=1 after a delete). */
export function DemoNotice({ show, className = "" }: { show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <p role="status" className={`mb-6 flex items-start gap-2 rounded-xl bg-cream-100 px-4 py-3 text-sm text-cocoa-600 ${className}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-cocoa-400" />
      {DEMO_MESSAGE}
    </p>
  );
}
