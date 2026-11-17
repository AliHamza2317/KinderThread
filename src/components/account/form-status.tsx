"use client";

import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

export function Submit({
  children,
  className,
  variant = "primary",
  size = "md",
  pending,
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  pending?: boolean;
}) {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={pending ?? status.pending} className={className} variant={variant} size={size}>
      {children}
    </Button>
  );
}

/**
 * useActionState wired so that the form keeps what the customer typed when the
 * server returns validation errors (React resets forms submitted through the
 * `action` prop). Without JS the plain `action` still works.
 */
export function useActionForm(fn: (prev: ActionResult, fd: FormData) => Promise<ActionResult>) {
  const [state, dispatch, pending] = useActionState(fn, null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let fd: FormData;
    try {
      fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    } catch {
      fd = new FormData(e.currentTarget);
    }
    startTransition(() => dispatch(fd));
  };
  return { state, pending, formProps: { action: dispatch, onSubmit } };
}

export function Notice({ state, className }: { state: ActionResult; className?: string }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn("rounded-2xl px-4 py-3 text-sm font-medium", state.ok ? "bg-sage-100 text-sage-800" : "bg-coral-100 text-coral-800", className)}
    >
      {state.message}
    </p>
  );
}

export function errorOf(state: ActionResult, key: string) {
  return state && !state.ok ? state.errors?.[key] : undefined;
}
