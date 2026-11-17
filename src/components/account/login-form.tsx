"use client";

import Link from "next/link";
import { loginAction } from "@/actions/account";
import { Field, Input } from "@/components/ui/field";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";
import { PasswordInput } from "./password-input";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, formProps } = useActionForm(loginAction);
  return (
    <form {...formProps} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor="email" error={errorOf(state, "email")}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!errorOf(state, "email")} />
      </Field>
      <Field label="Password" htmlFor="password" error={errorOf(state, "password")}>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!errorOf(state, "password")} />
      </Field>
      <div className="-mt-1 flex justify-end">
        <Link href="/account/forgot" className="text-sm font-semibold text-sage-700 link-underline">
          Forgot password?
        </Link>
      </div>
      <Notice state={state} />
      <Submit pending={pending} size="lg" className="w-full">
        Sign in
      </Submit>
      <p className="text-center text-[0.8rem] text-cocoa-400">Demo mode — sign-in isn&apos;t connected yet; you&apos;ll see a sample account.</p>
    </form>
  );
}
