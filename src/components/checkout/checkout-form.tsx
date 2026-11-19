"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Info, ShoppingBag } from "lucide-react";
import { FreeShippingMeter } from "@/components/layout/cart-drawer";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { checkoutSchema } from "@/lib/checkout-schema";
import { fieldErrors } from "@/lib/action-result";
import { newOrderNumber, useDemoOrders } from "@/stores/demo-orders";
import { useHydrated } from "@/lib/hooks";
import { PK_CITIES } from "@/lib/pk-cities";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { CouponField, SummaryLines, Totals } from "./order-summary";
import { useQuote } from "./use-quote";

export type PaymentOption = { id: string; label: string; instructions: string; fee: number; details: [string, string][] };

type Defaults = { name: string; email: string; phone: string; city: string; address: string; postalCode: string };

export function CheckoutForm({ options, defaults, freeThreshold, estimate }: { options: PaymentOption[]; defaults: Defaults; freeThreshold: number; estimate: string }) {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const [payment, setPayment] = useState(options[0]?.id ?? "");
  const { quote, loading } = useQuote(payment);
  const router = useRouter();
  const addDemoOrder = useDemoOrders((s) => s.add);
  const clearCart = useCart((s) => s.clear);
  const [pending, setPending] = useState(false);
  const [values, setValues] = useState<Defaults & { notes: string; paymentReference: string }>({ ...defaults, notes: "", paymentReference: "" });
  // each error clears as soon as that field is edited
  const [errs, setErrs] = useState<Record<string, string[] | undefined>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [hadFieldErrors, setHadFieldErrors] = useState(false);
  const err = (k: string) => errs[k];
  const fieldErrorsLeft = Object.values(errs).some((v) => v?.length);

  const fail = (message: string, errors: Record<string, string[]> = {}) => {
    setErrs(errors);
    setMsg(message);
    setHadFieldErrors(Object.keys(errors).length > 0);
    requestAnimationFrame(() => document.getElementById("checkout-message")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  /**
   * Frontend-only build: validate, then show a demo confirmation. The order is
   * kept in this browser only — nothing is sent or charged.
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse({ ...values, paymentMethod: payment });
    if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error.issues));
    const d = parsed.data;
    if (d.paymentMethod !== "cod" && !d.paymentReference)
      return fail("Please enter your transaction reference.", { paymentReference: ["Enter the transaction ID / reference from your transfer."] });
    if (!quote || !quote.itemCount) return fail("Your bag is empty or out of date. Please review it and try again.");
    setPending(true);
    const number = newOrderNumber();
    addDemoOrder({
      number,
      createdAt: new Date().toISOString(),
      status: "PENDING",
      customerName: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone,
      city: d.city,
      address: d.address,
      postalCode: d.postalCode || null,
      notes: d.notes || null,
      paymentMethod: d.paymentMethod,
      paymentReference: d.paymentReference || null,
      items: quote.lines.map((l) => ({ name: l.name, size: l.size, color: l.color, image: l.image, quantity: l.quantity, lineTotal: l.lineTotal })),
      subtotal: quote.subtotal,
      discount: quote.discount,
      shippingFee: quote.shippingFee + quote.paymentFee,
      total: quote.total,
      couponCode: quote.coupon?.code ?? null,
    });
    clearCart();
    router.push(`/checkout/success/${number}`);
  };

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
  const showMsg = msg && (!hadFieldErrors || fieldErrorsLeft);

  return (
    <div className="container-kt py-8 md:py-12">
      <CheckoutSteps current={1} />
      <h1 className="display-lg mt-5">
        Check<span className="font-serif-accent text-sage-700">out</span>
      </h1>
      <p className="mt-5 inline-flex items-start gap-2 rounded-2xl bg-sun-50 px-4 py-2.5 text-[0.85rem] text-cocoa-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sun-700" />
        Preview mode — placing an order shows a demo confirmation. Nothing is sent or charged yet.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12" noValidate>
        <input type="hidden" name="lines" value={JSON.stringify(lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))} />
        <input type="hidden" name="coupon" value={quote?.coupon?.code ?? ""} />
        <input type="hidden" name="paymentMethod" value={payment} />

        <div className="space-y-5 lg:col-span-7">
          <section aria-labelledby="contact-h" className="rounded-[1.75rem] border border-cocoa/10 bg-cream-50 p-5 md:p-8">
            <h2 id="contact-h" className="flex items-center gap-3 font-display text-[1.6rem] tracking-[-0.03em]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa font-sans text-[0.8rem] font-semibold text-cream-50">1</span>
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

          <section aria-labelledby="delivery-h" className="rounded-[1.75rem] border border-cocoa/10 bg-cream-50 p-5 md:p-8">
            <h2 id="delivery-h" className="flex items-center gap-3 font-display text-[1.6rem] tracking-[-0.03em]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa font-sans text-[0.8rem] font-semibold text-cream-50">2</span>
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

          <section aria-labelledby="pay-h" className="rounded-[1.75rem] border border-cocoa/10 bg-cream-50 p-5 md:p-8">
            <h2 id="pay-h" className="flex items-center gap-3 font-display text-[1.6rem] tracking-[-0.03em]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cocoa font-sans text-[0.8rem] font-semibold text-cream-50">3</span>
              Payment
            </h2>
            {options.length === 0 ? (
              <p className="mt-5 rounded-md bg-coral-50 p-4 text-sm text-coral-800">Online ordering is temporarily unavailable. Please contact us to place your order.</p>
            ) : (
              <div className="mt-5 space-y-3" role="radiogroup" aria-label="Payment method">
                {options.map((o) => {
                  const on = o.id === payment;
                  return (
                    <div key={o.id} className={cn("rounded-md border transition", on ? "border-cocoa bg-cream-50 shadow-soft" : "border-cocoa-100 hover:border-cocoa-300")}>
                      <label className="flex cursor-pointer items-center gap-4 p-4">
                        <input type="radio" name="_pay" checked={on} onChange={() => setPayment(o.id)} className="h-5 w-5 shrink-0 appearance-none rounded-full border border-cocoa-300 transition checked:border-[6px] checked:border-sage-600" />
                        <span className="flex-1 font-semibold">{o.label}</span>
                        {o.fee > 0 && <span className="text-sm text-cocoa-500">+{formatPrice(o.fee)}</span>}
                      </label>
                      {on && (
                        <div className="space-y-3 border-t border-cocoa-100 px-4 pt-3 pb-4 text-[0.88rem] text-cocoa-600">
                          <p>{o.instructions}</p>
                          {o.details.length > 0 && (
                            <dl className="grid gap-1 rounded-[1.5rem] bg-cream-100 p-3">
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
          <div className="sticky top-28 space-y-6 rounded-[2rem] bg-cream-100 p-6 md:p-8">
            <h2 className="font-display text-[1.6rem] tracking-[-0.03em]">Your order</h2>
            <SummaryLines quote={quote} />
            {hasSamples && (
              <p className="flex gap-2 rounded-2xl bg-cream-50 px-3.5 py-2.5 text-[0.8rem] text-cocoa-500">
                <Info className="h-4 w-4 shrink-0" /> Your bag contains sample listings used for testing the store.
              </p>
            )}
            <FreeShippingMeter subtotal={(quote?.subtotal ?? 0) - (quote?.discount ?? 0)} threshold={freeThreshold} />
            <CouponField value={couponCode} onApply={setCoupon} error={quote?.couponError} applied={quote?.coupon?.code} />
            <Totals quote={quote} />
            <div id="checkout-message" aria-live="assertive">
              {showMsg && <p className="rounded-2xl bg-coral-100 px-4 py-3 text-sm font-medium text-coral-800">{msg}</p>}
              {hasIssues && <p className="rounded-2xl bg-coral-100 px-4 py-3 text-sm font-medium text-coral-800">Some items changed — please review your bag.</p>}
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

/** Bag → Details → Confirmation, shown on the bag and checkout pages. */
export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  const steps = [
    { label: "Bag", href: "/cart" },
    { label: "Details", href: "/checkout" },
    { label: "Confirmation" },
  ];
  return (
    <ol className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase" aria-label="Checkout progress">
      {steps.map((st, i) => (
        <li key={st.label} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="h-px w-6 bg-cocoa/20" />}
          {st.href && i < current ? (
            <Link href={st.href} className="text-cocoa-500 hover:text-cocoa">
              {st.label}
            </Link>
          ) : (
            <span aria-current={i === current ? "step" : undefined} className={i === current ? "text-cocoa" : "text-cocoa-300"}>
              {st.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
