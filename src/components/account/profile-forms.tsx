"use client";

import { useEffect, useRef } from "react";
import { changePasswordAction, updateProfileAction } from "@/actions/account";
import { Field, Input } from "@/components/ui/field";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";
import { PasswordInput } from "./password-input";

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string | null }) {
  const { state, pending, formProps } = useActionForm(updateProfileAction);
  const err = (k: string) => errorOf(state, k);
  return (
    <form {...formProps} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="p-name" error={err("name")}>
          <Input id="p-name" name="name" autoComplete="name" required defaultValue={name} aria-invalid={!!err("name")} />
        </Field>
        <Field label="Mobile number" htmlFor="p-phone" optional error={err("phone")}>
          <Input id="p-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" defaultValue={phone ?? ""} aria-invalid={!!err("phone")} />
        </Field>
        <Field label="Email" htmlFor="p-email" className="sm:col-span-2" error={err("email")}>
          <Input id="p-email" name="email" type="email" autoComplete="email" required defaultValue={email} aria-invalid={!!err("email")} />
        </Field>
      </div>
      <Notice state={state} />
      <div>
        <Submit pending={pending}>Save details</Submit>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { state, pending, formProps } = useActionForm(changePasswordAction);
  const form = useRef<HTMLFormElement>(null);
  const err = (k: string) => errorOf(state, k);
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} {...formProps} className="flex flex-col gap-4" noValidate>
      <Field label="Current password" htmlFor="pw-current" error={err("current")}>
        <PasswordInput id="pw-current" name="current" autoComplete="current-password" required aria-invalid={!!err("current")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="pw-new" error={err("password")} hint="At least 8 characters.">
          <PasswordInput id="pw-new" name="password" autoComplete="new-password" required minLength={8} aria-invalid={!!err("password")} />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm" error={err("confirm")}>
          <PasswordInput id="pw-confirm" name="confirm" autoComplete="new-password" required aria-invalid={!!err("confirm")} />
        </Field>
      </div>
      <Notice state={state} />
      <div>
        <Submit pending={pending}>Update password</Submit>
      </div>
    </form>
  );
}
