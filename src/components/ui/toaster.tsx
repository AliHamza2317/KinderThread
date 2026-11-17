"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Check, Info, X } from "lucide-react";
import { useToasts } from "@/stores/toast";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md bg-cocoa-800 px-4 py-3.5 text-cream-50 shadow-lift"
            role="status"
          >
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${t.tone === "error" ? "bg-coral" : "bg-sage-500"}`}>
              {t.tone === "error" ? <X className="h-3.5 w-3.5 text-cocoa-900" /> : t.tone === "info" ? <Info className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[0.8rem] text-cream-200/80">{t.description}</p>}
            </div>
            {t.action && (
              <Link href={t.action.href} className="shrink-0 self-center rounded-full bg-cream-50/10 px-3 py-1.5 text-xs font-bold hover:bg-cream-50/20" onClick={() => dismiss(t.id)}>
                {t.action.label}
              </Link>
            )}
            <button onClick={() => dismiss(t.id)} className="shrink-0 text-cream-200/60 hover:text-cream-50" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
