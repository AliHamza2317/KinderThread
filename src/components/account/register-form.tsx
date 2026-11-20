"use client";

import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { registerAction } from "@/actions/account";
import { Field, Input } from "@/components/ui/field";
import { authInput, OrDivider, SocialButtons, WithIcon } from "./auth-bits";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";
import { PasswordInput } from "./password-input";

export function RegisterForm({ next }: { next: string }) {
  const { state, pending, formProps } = useActionForm(registerAction);
  const err = (k: string) => errorOf(state, k);
  return (
    <form {...formProps} className="flex flex-col gap-5 [&_label[for]]:text-[0.9rem] [&_label[for]]:font-semibold [&_label[for]]:text-cocoa" noValidate>
      <input type="hidden" name="next" value={next} />
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Full name" htmlFor="name" error={err("name")}>
        <WithIcon icon={User}>
          <Input id="name" name="name" autoComplete="name" placeholder="Your name" required aria-invalid={!!err("name")} className={authInput} />
        </WithIcon>
      </Field>
      <Field label="Email Address" htmlFor="email" error={err("email")}>
        <WithIcon icon={Mail}>
          <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" required aria-invalid={!!err("email")} className={authInput} />
        </WithIcon>
      </Field>
      <Field label="Mobile number" htmlFor="phone" optional error={err("phone")} hint="For delivery updates.">
        <WithIcon icon={Phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="03XX XXXXXXX" aria-invalid={!!err("phone")} className={authInput} />
        </WithIcon>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" error={err("password")} hint="At least 8 characters.">
          <WithIcon icon={Lock}>
            <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Password" required minLength={8} aria-invalid={!!err("password")} className={authInput} />
          </WithIcon>
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={err("confirm")}>
          <WithIcon icon={Lock}>
            <PasswordInput id="confirm" name="confirm" autoComplete="new-password" placeholder="Repeat it" required aria-invalid={!!err("confirm")} className={authInput} />
          </WithIcon>
        </Field>
      </div>
      <Notice state={state} />
      <Submit
        pending={pending}
        size="lg"
        className="h-14 w-full bg-gradient-to-r from-[#3f4f37] to-[#20281b] text-[1.02rem] shadow-[0_20px_34px_-18px_rgb(32_40_27/0.9)] hover:from-[#4a5d41] hover:to-[#28321f]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
          <ArrowRight className="h-4 w-4" />
        </span>
        Create account
      </Submit>
      <OrDivider />
      <SocialButtons />
      <p className="text-center text-[0.78rem] leading-relaxed text-cocoa-500">
        By creating an account you agree to our{" "}
        <a href="/pages/terms" className="underline underline-offset-2">
          terms
        </a>{" "}
        and{" "}
        <a href="/pages/privacy" className="underline underline-offset-2">
          privacy policy
        </a>
        . <span className="text-cocoa-400">Demo mode — accounts aren&apos;t connected yet.</span>
      </p>
    </form>
  );
}
