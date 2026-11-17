import type { Metadata } from "next";
import { CheckoutForm, type PaymentOption } from "@/components/checkout/checkout-form";
import { PAYMENT_LABELS } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  const p = settings.payments;
  const options: PaymentOption[] = [];
  if (p.cod.enabled) options.push({ id: "cod", label: PAYMENT_LABELS.cod, instructions: p.cod.instructions, fee: p.cod.fee, details: [] });
  if (p.bank.enabled)
    options.push({
      id: "bank",
      label: PAYMENT_LABELS.bank,
      instructions: p.bank.instructions,
      fee: 0,
      details: [
        ["Bank", p.bank.bankName],
        ["Account title", p.bank.accountTitle],
        ["Account number", p.bank.accountNumber],
        ["IBAN", p.bank.iban],
      ].filter(([, v]) => v) as [string, string][],
    });
  for (const k of ["jazzcash", "easypaisa"] as const)
    if (p[k].enabled)
      options.push({
        id: k,
        label: PAYMENT_LABELS[k],
        instructions: p[k].instructions,
        fee: 0,
        details: [
          ["Account title", p[k].accountTitle],
          ["Account number", p[k].number],
        ].filter(([, v]) => v) as [string, string][],
      });

  return (
    <CheckoutForm
      options={options}
      freeThreshold={settings.shipping.freeThreshold}
      estimate={settings.shipping.estimate}
      defaults={{ name: "", email: "", phone: "", city: "", address: "", postalCode: "" }}
    />
  );
}
