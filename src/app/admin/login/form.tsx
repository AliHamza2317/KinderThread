"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/actions/session";
import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { Field, Input } from "@/components/ui/field";

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLoginAction, null);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="mt-2 w-full">Sign in</SubmitButton>
    </form>
  );
}
