"use client";

import { useActionState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { FormMessage } from "@/components/admin/form-bits";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { toast } from "@/stores/toast";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * React 19 resets uncontrolled form fields after every action — including
 * failed ones. This puts the submitted values back when the server rejects them,
 * so people don't lose what they typed.
 */
export function useRestoreOnError(state: ActionResult) {
  const formRef = useRef<HTMLFormElement>(null);
  const snapshot = useRef<FormData | null>(null);
  useLayoutEffect(() => {
    const form = formRef.current;
    const data = snapshot.current;
    if (!form || !data || !state || state.ok) return;
    for (const el of Array.from(form.elements)) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) || !el.name) continue;
      if (el instanceof HTMLInputElement && (el.type === "hidden" || el.type === "file")) continue;
      if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        el.checked = data.getAll(el.name).includes(el.value || "on");
      } else {
        const v = data.get(el.name);
        if (typeof v === "string") el.value = v;
      }
    }
  }, [state]);
  const onSubmit = () => {
    if (formRef.current) snapshot.current = new FormData(formRef.current);
  };
  return { formRef, onSubmit };
}

/**
 * Small wrapper around useActionState: renders a form bound to a server action,
 * shows the result inline and as a toast.
 */
export function ActionForm({
  action,
  children,
  className,
  toastOnSuccess = true,
  showMessage = true,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  toastOnSuccess?: boolean;
  showMessage?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const { formRef, onSubmit } = useRestoreOnError(state);
  const last = useRef<ActionResult>(null);
  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok && toastOnSuccess && state.message) toast({ title: state.message });
    if (!state.ok && state.message) toast({ title: state.message, tone: "error" });
  }, [state, toastOnSuccess]);
  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className={cn(className)}>
      {children}
      {showMessage && state && !state.ok && <FormMessage state={state} className="mt-3" />}
    </form>
  );
}
