"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, variant = "primary", size = "md", className, pendingLabel }: { children: ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md"; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} loading={pending} className={className}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

export function FormMessage({ state, className }: { state: ActionResult<unknown>; className?: string }) {
  if (!state?.message) return null;
  return (
    <p role="status" className={cn("rounded-xl px-4 py-3 text-sm font-medium", state.ok ? "bg-sage-100 text-sage-800" : "bg-coral-100 text-coral-800", className)}>
      {state.message}
    </p>
  );
}

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmSubmit({ children, message, variant = "danger", size = "sm", className }: { children: ReactNode; message: string; variant?: "danger" | "secondary" | "ghost" | "primary"; size?: "sm" | "md"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      loading={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
