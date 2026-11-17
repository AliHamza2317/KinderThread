"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Lock, Info, ShoppingBag } from "lucide-react";
import { placeOrderAction } from "@/actions/checkout";
import { FreeShippingMeter } from "@/components/layout/cart-drawer";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import type { ActionResult } from "@/lib/action-result";
import { useHydrated } from "@/lib/hooks";
import { PK_CITIES } from "@/lib/pk-cities";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { CouponField, SummaryLines, Totals } from "./order-summary";
import { useQuote } from "./use-quote";

export type PaymentOption = { id: string; label: string; instructions: string; fee: number; details: [string, string][] };

type Defaults = { name: string; email: string; phone: string; city: string; address: string; postalCode: string };

export function CheckoutForm({ options, defaults, freeThreshold, estimate, signedIn }: { options: PaymentOption[]; defaults: Defaults; freeThreshold: number; estimate: string; signedIn: boolean }) {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const [payment, setPayment] = useState(options[0]?.id ?? "");
  const { quote, loading } = useQuote(payment);
  const [state, action, pending] = useActionState<ActionResult, FormData>(placeOrderAction, null);
  // keep what the customer typed if the server rejects the order
  const [values, setValues] = useState<Defaults & { notes: string; paymentReference: string }>({ ...defaults, notes: "", paymentReference: "" });
  // server errors are copied locally so each one clears as soon as that field is edited
  const [errs, setErrs] = useState<Record<string, string[] | undefined>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const err = (k: string) => errs[k];
  const fieldErrorsLeft = Object.values(errs).some((v) => v?.length);

  useEffect(() => {
    if (state && !state.ok) {
      setErrs(state.errors ?? {});
      setMsg(state.message);
      document.getElementById("checkout-message")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  if (!hydrated) return <div className="container-kt min-h-[60vh] py-16" />;
  if (!lines.length)
    return (
      <div className="container-kt flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-10 w-10 text-cocoa-400" />
        <h1 className="display-md mt-6">Your bag is empty</h1>
        <ButtonLink href="/shop" className="mt-8">
          Start shopping
        </ButtonLink>
      </div>
    );

  const selected = options.find((o) => o.id === payment);
  const hasIssues = !!quote?.lines.some((l) => l.issue);
  const hasSamples = !!quote?.lines.some((l) => l.isSample);
  const bind = (k: keyof typeof values) => ({
    name: k,
    value: values[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [k]: e.target.value }));
      if (errs[k]) setErrs((x) => ({ ...x, [k]: undefined }));
    },
  });
  const hadFieldErrors = !!(state && !state.ok && state.errors && Object.keys(state.errors).length);
  const showMsg = msg && (!hadFieldErrors || fieldErrorsLeft);

  return (
    <div className="container-kt py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-lg">Checkout</h1>
        <p className="flex items-center gap-2 text-sm text-cocoa-500">
          <Lock className="h-4 w-4" /> Secure checkout
        </p>
      </div>
      {!signedIn && (
        <p className="mt-4 text-sm text-cocoa-500">
          Have an account?{" "}
          <Link href="/account/login?next=/checkout" className="font-bold text-sage-700 underline underline-offset-2">
            Sign in
          </Link>{" "}
          for faster checkout and order history — or continue as a guest.
        </p>
      )}

      <form action={action} className="mt-10 grid gap-12 lg:grid-cols-12" noValidate>
        <input type="hidden" name="lines" value={JSON.stringify(lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))} />
        <input type="hidden" name="coupon" value={quote?.coupon?.code ?? ""} />
        <input type="hidden" name="paymentMethod" value={payment} />

        <div className="space-y-12 lg:col-span-7">
          <section aria-labelledby="contact-h">
            <h2 id="contact-h" className="font-display text-2xl">
              Contact
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="name" error={err("name")} className="sm:col-span-2">
                <Input id="name" autoComplete="name" required aria-invalid={!!err("name")} {...bind("name")} />
              </Field>
              <Field label="Mobile number" htmlFor="phone" error={err("phone")} hint="For delivery updates and order confirmation.">
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" required aria-invalid={!!err("phone")} {...bind("phone")} />
              </Field>
              <Field label="Email" htmlFor="email" error={err("email")}>
                <Input id="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} {...bind("email")} />
              </Field>
            </div>
          </section>

          <section aria-labelledby="delivery-h">
            <h2 id="delivery-h" className="font-display text-2xl">
              Delivery
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="city" error={err("city")}>
                <Input id="city" list="pk-cities" autoComplete="address-level2" required aria-invalid={!!err("city")} {...bind("city")} />
                <datalist id="pk-cities">
                  {PK_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Postal code" htmlFor="postalCode" optional error={err("postalCode")}>
                <Input id="postalCode" inputMode="numeric" autoComplete="postal-code" {...bind("postalCode")} />
              </Field>
              <Field label="Complete address" htmlFor="address" error={err("address")} hint="House / flat number, street, area and a nearby landmark." className="sm:col-span-2">
                <Textarea id="address" autoComplete="street-address" required rows={3} aria-invalid={!!err("address")} {...bind("address")} />
              </Field>
              <Field label="Order notes" htmlFor="notes" optional className="sm:col-span-2">
                <Textarea id="notes" rows={2} placeholder="Anything we should know about delivery?" {...bind("notes")} />
              </Field>
            </div>
            <p className="mt-3 text-[0.82rem] text-cocoa-500">Estimated delivery: {estimate}.</p>
          </section>

          <section aria-labelledby="pay-h">
            <h2 id="pay-h" className="font-display text-2xl">
              Payment
            </h2>
            {options.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-coral-50 p-4 text-sm text-coral-800">Online ordering is temporarily unavailable. Please contact us to place your order.</p>
            ) : (
              <div className="mt-5 space-y-3" role="radiogroup" aria-label="Payment method">
                {options.map((o) => {
                  const on = o.id === payment;
                  return (
                    <div key={o.id} className={cn("rounded-2xl border transition", on ? "border-cocoa bg-cream-50 shadow-soft" : "border-cocoa-100 hover:border-cocoa-300")}>
                      <label className="flex cursor-pointer items-center gap-4 p-4">
                        <input type="radio" name="_pay" checked={on} onChange={() => setPayment(o.id)} className="h-5 w-5 shrink-0 appearance-none rounded-full border border-cocoa-300 transition checked:border-[6px] checked:border-sage-600" />
                        <span className="flex-1 font-semibold">{o.label}</span>
                        {o.fee > 0 && <span className="text-sm text-cocoa-500">+{formatPrice(o.fee)}</span>}
                      </label>
                      {on && (
                        <div className="space-y-3 border-t border-cocoa-100 px-4 pt-3 pb-4 text-[0.88rem] text-cocoa-600">
                          <p>{o.instructions}</p>
                          {o.details.length > 0 && (
                            <dl className="grid gap-1 rounded-xl bg-cream-100 p-3">
                              {o.details.map(([k, v]) => (
                                <div key={k} className="flex flex-wrap justify-between gap-2">
                                  <dt className="text-cocoa-500">{k}</dt>
                                  <dd className="font-bold text-cocoa select-all">{v}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          {o.id !== "cod" && (
                            <Field label="Transaction ID / reference" htmlFor="paymentReference" error={err("paymentReference")} hint={quote ? `Please transfer ${formatPrice(quote.total)} first, then enter the reference here.` : undefined}>
                              <Input id="paymentReference" aria-invalid={!!err("paymentReference")} {...bind("paymentReference")} />
                            </Field>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          <Checkbox name="newsletter" label="Email me about new arrivals and offers (optional)" />
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 space-y-6 rounded-[1.75rem] bg-cream-100 p-6 md:p-8">
            <h2 className="font-display text-2xl">Your order</h2>
            <SummaryLines quote={quote} />
            {hasSamples && (
              <p className="flex gap-2 rounded-xl bg-sun-50 p-3 text-[0.8rem] text-sun-700 ring-1 ring-sun-200">
                <Info className="h-4 w-4 shrink-0" /> Your bag contains sample listings used for testing the store.
              </p>
            )}
            <FreeShippingMeter subtotal={(quote?.subtotal ?? 0) - (quote?.discount ?? 0)} threshold={freeThreshold} />
            <CouponField value={couponCode} onApply={setCoupon} error={quote?.couponError} applied={quote?.coupon?.code} />
            <Totals quote={quote} />
            <div id="checkout-message" aria-live="assertive">
              {showMsg && <p className="rounded-xl bg-coral-100 px-4 py-3 text-sm font-medium text-coral-800">{msg}</p>}
              {hasIssues && <p className="rounded-xl bg-coral-100 px-4 py-3 text-sm font-medium text-coral-800">Some items changed — please review your bag.</p>}
            </div>
            <Button type="submit" size="lg" className="w-full" loading={pending} disabled={loading || hasIssues || !options.length || !quote?.itemCount}>
              {pending ? "Placing order…" : quote ? `Place order · ${formatPrice(quote.total)}` : "Place order"}
            </Button>
            <p className="text-center text-[0.75rem] text-cocoa-500">
              By placing your order you agree to our{" "}
              <Link href="/pages/terms" className="underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/pages/returns" className="underline">
                returns policy
              </Link>
              .
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
