"use client";

import Image from "next/image";
import { Tag, X } from "lucide-react";
import { useState } from "react";
import type { CartQuote } from "@/lib/pricing";
import { sizeLabel } from "@/lib/sizes";
import { formatPrice } from "@/lib/utils";

export function Totals({ quote, showPaymentFee = true }: { quote: CartQuote | null; showPaymentFee?: boolean }) {
  if (!quote) return <div className="h-32 animate-pulse rounded-[1.5rem] bg-cocoa-50" />;
  return (
    <dl className="space-y-2.5 text-[0.92rem]">
      <div className="flex justify-between">
        <dt className="text-cocoa-600">Subtotal</dt>
        <dd className="font-semibold">{formatPrice(quote.subtotal)}</dd>
      </div>
      {quote.discount > 0 && (
        <div className="flex justify-between text-sage-700">
          <dt>Discount {quote.coupon && <span className="font-bold">({quote.coupon.code})</span>}</dt>
          <dd className="font-semibold">−{formatPrice(quote.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-cocoa-600">Delivery</dt>
        <dd className="font-semibold">{quote.shippingFee === 0 ? <span className="text-sage-700">Free</span> : formatPrice(quote.shippingFee)}</dd>
      </div>
      {showPaymentFee && quote.paymentFee > 0 && (
        <div className="flex justify-between">
          <dt className="text-cocoa-600">Cash on delivery fee</dt>
          <dd className="font-semibold">{formatPrice(quote.paymentFee)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-cocoa-100 pt-3.5">
        <dt className="font-bold">Total</dt>
        <dd className="text-2xl font-bold">{formatPrice(quote.total)}</dd>
      </div>
    </dl>
  );
}

export function CouponField({ value, onApply, error, applied }: { value: string; onApply: (code: string) => void; error?: string; applied?: string | null }) {
  const [code, setCode] = useState(value);
  if (applied)
    return (
      <div className="flex items-center justify-between rounded-md bg-sage-50 px-4 py-3 text-sm ring-1 ring-sage-200">
        <span className="flex items-center gap-2 font-semibold text-sage-800">
          <Tag className="h-4 w-4" /> {applied} applied
        </span>
        <button
          type="button"
          onClick={() => {
            setCode("");
            onApply("");
          }}
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-sage-100"
          aria-label="Remove discount code"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  return (
    <div>
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">
          Discount code
        </label>
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onApply(code.trim());
            }
          }}
          placeholder="Discount code"
          className="h-11 min-w-0 flex-1 rounded-full border border-cocoa-100 bg-cream-50 px-4 text-sm uppercase placeholder:normal-case focus:border-sage-500 focus:outline-none"
          aria-invalid={!!error}
          aria-describedby="coupon-error"
        />
        <button type="button" onClick={() => onApply(code.trim())} disabled={!code.trim()} className="h-11 rounded-full bg-cocoa-800 px-5 text-[0.82rem] font-semibold text-cream-50 transition hover:bg-cocoa-800 disabled:opacity-40">
          Apply
        </button>
      </div>
      {error && (
        <p id="coupon-error" className="mt-2 text-[0.8rem] font-medium text-coral-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SummaryLines({ quote }: { quote: CartQuote | null }) {
  if (!quote) return null;
  return (
    <ul className="divide-y divide-cocoa-100">
      {quote.lines.map((l) => (
        <li key={l.variantId} className="flex gap-4 py-4">
          <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100">
            {l.image && <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />}
            <span className="absolute -top-0 -right-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-cocoa px-1 text-[0.65rem] font-bold text-cream-50">{l.quantity}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.9rem] leading-snug font-semibold">{l.name}</p>
            <p className="text-[0.78rem] text-cocoa-500">{[l.color, sizeLabel(l.size)].filter(Boolean).join(" · ")}</p>
            {l.issue && <p className="mt-1 text-[0.78rem] font-semibold text-coral-700">{l.issue}</p>}
          </div>
          <p className="text-[0.9rem] font-semibold">{formatPrice(l.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}
