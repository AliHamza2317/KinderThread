"use client";

import { useActionState, useState } from "react";
import { deleteCouponAction, saveCouponAction } from "@/actions/admin/sales";
import { ConfirmSubmit, FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { Card, FormGrid } from "@/components/admin/ui";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { COUPON_TYPE_LABEL } from "./labels";
import { ActionForm, useRestoreOnError } from "./action-form";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  usedCount: number;
};

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [state, action] = useActionState(saveCouponAction, null);
  const [type, setType] = useState<Coupon["type"]>(coupon?.type ?? "PERCENT");
  const { formRef, onSubmit } = useRestoreOnError(state);
  const err = (k: string) => (state && !state.ok ? state.errors?.[k] : undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form ref={formRef} action={action} onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        {coupon && <input type="hidden" name="id" value={coupon.id} />}
        <Card title="Code & discount">
          <FormGrid>
            <Field label="Code" htmlFor="code" error={err("code")} hint="Customers type this at checkout. Letters, numbers, dashes.">
              <Input id="code" name="code" defaultValue={coupon?.code} required maxLength={32} className="font-mono uppercase" autoCapitalize="characters" aria-invalid={!!err("code")} />
            </Field>
            <Field label="Description" htmlFor="description" optional error={err("description")} hint="Shown to the customer when the code is applied.">
              <Input id="description" name="description" defaultValue={coupon?.description ?? ""} maxLength={160} placeholder="e.g. 10% off your first order" />
            </Field>
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as Coupon["type"])}>
                {(Object.keys(COUPON_TYPE_LABEL) as Coupon["type"][]).map((t) => (
                  <option key={t} value={t}>
                    {COUPON_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            {type !== "FREE_SHIPPING" ? (
              <Field label={type === "PERCENT" ? "Percentage off" : "Amount off (Rs.)"} htmlFor="value" error={err("value")}>
                <Input id="value" name="value" type="number" inputMode="numeric" min={1} max={type === "PERCENT" ? 100 : undefined} defaultValue={coupon && coupon.type !== "FREE_SHIPPING" ? coupon.value : ""} required aria-invalid={!!err("value")} />
              </Field>
            ) : (
              <p className="self-end rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-800">Delivery will be free for orders using this code.</p>
            )}
          </FormGrid>
        </Card>

        <Card title="Limits & schedule">
          <FormGrid>
            <Field label="Minimum order (Rs.)" htmlFor="minSubtotal" optional error={err("minSubtotal")}>
              <Input id="minSubtotal" name="minSubtotal" type="number" inputMode="numeric" min={0} defaultValue={coupon?.minSubtotal ?? ""} />
            </Field>
            <Field label="Maximum uses" htmlFor="maxUses" optional error={err("maxUses")} hint="Across all customers. Leave blank for unlimited.">
              <Input id="maxUses" name="maxUses" type="number" inputMode="numeric" min={1} defaultValue={coupon?.maxUses ?? ""} />
            </Field>
            <Field label="Starts" htmlFor="startsAt" optional error={err("startsAt")}>
              <Input id="startsAt" name="startsAt" type="date" defaultValue={coupon?.startsAt} />
            </Field>
            <Field label="Ends" htmlFor="endsAt" optional error={err("endsAt")} hint="Valid until the end of this day.">
              <Input id="endsAt" name="endsAt" type="date" defaultValue={coupon?.endsAt} aria-invalid={!!err("endsAt")} />
            </Field>
          </FormGrid>
          <Checkbox name="isActive" defaultChecked={coupon?.isActive ?? true} label="Active — customers can use this code" className="mt-5" />
        </Card>

        <FormMessage state={state} />
        <div className="flex gap-3">
          <SubmitButton>{coupon ? "Save coupon" : "Create coupon"}</SubmitButton>
        </div>
      </form>

      {coupon && (
        <div className="flex flex-col gap-6">
          <Card title="Usage">
            <p className="font-display text-3xl tabular-nums">
              {coupon.usedCount}
              {coupon.maxUses != null && <span className="text-lg text-cocoa-400"> / {coupon.maxUses}</span>}
            </p>
            <p className="mt-1 text-sm text-cocoa-500">orders placed with this code (cancelled orders give the use back).</p>
          </Card>
          <Card title="Delete coupon" description="Past orders keep the code on record.">
            <ActionForm action={deleteCouponAction}>
              <input type="hidden" name="id" value={coupon.id} />
              <ConfirmSubmit message={`Delete coupon ${coupon.code}? Customers will no longer be able to use it.`}>Delete</ConfirmSubmit>
            </ActionForm>
          </Card>
        </div>
      )}
    </div>
  );
}
