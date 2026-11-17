"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { subscribeAction, type SubscribeState } from "@/actions/storefront";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm({ source = "NEWSLETTER", tone = "dark", cta = "Subscribe", className }: { source?: "NEWSLETTER" | "LAUNCH" | "TRYON"; tone?: "dark" | "light"; cta?: string; className?: string }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribeAction, null);
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (state?.ok) setEmail("");
  }, [state]);
  const dark = tone === "dark";
  return (
    <form action={action} className={cn("w-full", className)} noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={cn("flex flex-col gap-3 rounded-[1.75rem] p-1.5 sm:flex-row sm:rounded-full", dark ? "bg-cream-50/10 ring-1 ring-cream-50/25 focus-within:ring-cream-50/60" : "bg-cream-50 ring-1 ring-cocoa-100 focus-within:ring-sage-500")}>
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={state?.ok === false || undefined}
          aria-describedby={`nl-${source}-msg`}
          className={cn("h-12 min-w-0 flex-1 rounded-full bg-transparent px-5 text-[0.95rem] focus:outline-none", dark ? "text-cream-50 placeholder:text-cream-200/60" : "text-cocoa placeholder:text-cocoa-400")}
        />
        <Button type="submit" variant={dark ? "coral" : "primary"} loading={pending} className="h-12 shrink-0">
          {cta}
        </Button>
      </div>
      <p id={`nl-${source}-msg`} role="status" aria-live="polite" className={cn("mt-3 min-h-5 text-sm font-medium", state?.ok ? (dark ? "text-sun-200" : "text-sage-700") : dark ? "text-coral-200" : "text-coral-700")}>
        {state?.ok && <Check className="mr-1.5 inline h-4 w-4" />}
        {state?.message}
      </p>
    </form>
  );
}

export function NewsletterSection({ heading, body }: { heading: string; body: string }) {
  return (
    <section className="container-kt">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-sage-700 px-6 py-16 text-cream-50 md:px-16 md:py-24">
        <svg className="pointer-events-none absolute -right-10 -bottom-10 h-[340px] w-[340px] text-honey opacity-80 md:right-10" viewBox="0 0 200 200" aria-hidden>
          <path d="M100 168 C 30 120, 40 52, 100 82 C 160 52, 170 120, 100 168 M100 168 C 110 186, 140 190, 160 176" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="relative max-w-2xl">
          <p className="eyebrow eyebrow-rule text-cream-200">Newsletter</p>
          <h2 className="display-lg mt-5 text-cream-50">{heading}</h2>
          <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-cream-200/85">{body}</p>
          <NewsletterForm className="mt-8 max-w-xl" />
        </div>
      </div>
    </section>
  );
}
