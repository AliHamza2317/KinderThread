"use client";

import { registerAction } from "@/actions/account";
import { Field, Input } from "@/components/ui/field";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";
import { PasswordInput } from "./password-input";

export function RegisterForm({ next }: { next: string }) {
  const { state, pending, formProps } = useActionForm(registerAction);
  const err = (k: string) => errorOf(state, k);
  return (
    <form {...formProps} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Full name" htmlFor="name" error={err("name")}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={!!err("name")} />
      </Field>
      <Field label="Email" htmlFor="email" error={err("email")}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!err("email")} />
      </Field>
      <Field label="Mobile number" htmlFor="phone" optional error={err("phone")} hint="Used for delivery updates, e.g. 0300 1234567.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="03XX XXXXXXX" aria-invalid={!!err("phone")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" error={err("password")} hint="At least 8 characters.">
          <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} aria-invalid={!!err("password")} />
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={err("confirm")}>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required aria-invalid={!!err("confirm")} />
        </Field>
      </div>
      <Notice state={state} />
      <Submit pending={pending} size="lg" className="w-full text-[0.8rem] tracking-[0.16em] uppercase">
        Create account
      </Submit>
      <p className="text-center text-[0.8rem] text-cocoa-400">Demo mode — sign-in isn&apos;t connected yet; you&apos;ll see a sample account.</p>
      <p className="text-center text-[0.8rem] text-cocoa-500">
        By creating an account you agree to our{" "}
        <a href="/pages/terms" className="underline underline-offset-2">
          terms
        </a>{" "}
        and{" "}
        <a href="/pages/privacy" className="underline underline-offset-2">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
