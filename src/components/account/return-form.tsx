"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { requestReturnAction } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { RETURN_REASONS } from "./constants";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";

export function ReturnRequestForm({ orderNumber, deadline }: { orderNumber: string; deadline?: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"RETURN" | "EXCHANGE">("EXCHANGE");
  const { state, pending, formProps } = useActionForm(requestReturnAction);

  if (state?.ok) return <Notice state={state} />;

  if (!open)
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-cocoa-500">
          Not quite right? You can request a return or exchange{deadline ? ` until ${deadline}` : ""}.
        </p>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <RotateCcw className="h-4 w-4" /> Request return or exchange
        </Button>
      </div>
    );

  return (
    <form {...formProps} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="type" value={type} />
      <fieldset>
        <legend className="mb-2 text-[0.82rem] font-semibold text-cocoa-600">What would you like to do?</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {(
            [
              ["EXCHANGE", "Exchange", "Swap for another size"],
              ["RETURN", "Return", "Send it back for a refund"],
            ] as const
          ).map(([v, label, hint]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={type === v}
              onClick={() => setType(v)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                type === v ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa-100 bg-cream-50 hover:border-cocoa-300",
              )}
            >
              <span className="block text-sm font-bold">{label}</span>
              <span className={cn("block text-[0.78rem]", type === v ? "text-cream-200" : "text-cocoa-500")}>{hint}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Reason" htmlFor="reason" error={errorOf(state, "reason")}>
        <Select id="reason" name="reason" required defaultValue="">
          <option value="" disabled>
            Choose a reason
          </option>
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Details"
        htmlFor="details"
        optional
        error={errorOf(state, "details")}
        hint={type === "EXCHANGE" ? "Tell us which item and the size you'd like instead." : "Which item(s) would you like to return?"}
      >
        <Textarea id="details" name="details" maxLength={1000} rows={4} />
      </Field>
      <Notice state={state} />
      <div className="flex flex-wrap gap-3">
        <Submit pending={pending}>Send request</Submit>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
