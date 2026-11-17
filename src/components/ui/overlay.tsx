"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useLockScroll } from "@/lib/hooks";

function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? []);
    requestAnimationFrame(() => (node?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0])?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useFocusTrap(open, onClose);
  const id = useId();
  useLockScroll(open);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80]" data-lenis-prevent>
            <motion.div
              className="absolute inset-0 bg-cocoa-900/35 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={id}
              className={cn(
                "absolute top-0 flex h-full w-full max-w-[440px] flex-col bg-cream shadow-lift",
                side === "right" ? "right-0" : "left-0",
                className,
              )}
              initial={{ x: side === "right" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: side === "right" ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
            >
              <div className="flex items-center justify-between border-b border-cocoa-100 px-6 py-5">
                <h2 id={id} className="font-display text-2xl">
                  {title}
                </h2>
                <button onClick={onClose} className="-mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-cocoa-50" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
              {footer && <div className="border-t border-cocoa-100 px-6 py-5">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  hideTitle,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  hideTitle?: boolean;
}) {
  const ref = useFocusTrap(open, onClose);
  const id = useId();
  useLockScroll(open);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" data-lenis-prevent>
            <motion.div
              className="absolute inset-0 bg-cocoa-900/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={id}
              className={cn(
                "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-md bg-cream shadow-lift sm:max-w-lg sm:rounded-sm",
                className,
              )}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
            >
              <div className={cn("sticky top-0 z-10 flex items-center justify-between bg-cream/95 px-6 pt-5 pb-3 backdrop-blur", hideTitle && "pb-0")}>
                <h2 id={id} className={cn("font-display text-2xl", hideTitle && "sr-only")}>
                  {title}
                </h2>
                <button onClick={onClose} className="-mr-2 ml-auto grid h-10 w-10 place-items-center rounded-full hover:bg-cocoa-50" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 pb-6">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
