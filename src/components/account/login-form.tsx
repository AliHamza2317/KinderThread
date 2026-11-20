"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginAction } from "@/actions/account";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { authInput, WithIcon } from "./auth-bits";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";
import { PasswordInput } from "./password-input";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, formProps } = useActionForm(loginAction);
  return (
    <form {...formProps} className="flex flex-col gap-5 [&_label[for]]:text-[0.9rem] [&_label[for]]:font-semibold [&_label[for]]:text-cocoa" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Email Address" htmlFor="email" error={errorOf(state, "email")}>
        <WithIcon icon={Mail}>
          <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" required aria-invalid={!!errorOf(state, "email")} className={authInput} />
        </WithIcon>
      </Field>
      <Field label="Password" htmlFor="password" error={errorOf(state, "password")}>
        <WithIcon icon={Lock}>
          <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Enter your password" required aria-invalid={!!errorOf(state, "password")} className={authInput} />
        </WithIcon>
      </Field>
      <div className="-mt-1 flex items-center justify-between gap-4">
        <Checkbox name="remember" label="Remember me" className="text-[0.88rem]" />
        <Link href="/account/forgot" className="text-[0.88rem] font-semibold text-sage-700 hover:text-sage-800">
          Forgot password?
        </Link>
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
        Sign in
      </Submit>
      <p className="text-center text-[0.74rem] text-cocoa-400">Demo mode — sign-in isn&apos;t connected yet; you&apos;ll see a sample account.</p>
    </form>
  );
}
