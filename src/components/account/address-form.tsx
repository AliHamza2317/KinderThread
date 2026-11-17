"use client";

import { useEffect, useId } from "react";
import { saveAddressAction } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { PK_CITIES } from "@/lib/pk-cities";
import { Notice, Submit, errorOf, useActionForm } from "./form-status";

export type AddressValues = {
  id?: string;
  label?: string | null;
  fullName: string;
  phone: string;
  city: string;
  line1: string;
  line2?: string | null;
  postalCode?: string | null;
  isDefault?: boolean;
};

export function AddressForm({ initial, onDone, onCancel, defaultName, defaultPhone }: { initial?: AddressValues; onDone: (message?: string) => void; onCancel: () => void; defaultName?: string; defaultPhone?: string | null }) {
  const { state, pending, formProps } = useActionForm(saveAddressAction);
  const uid = useId();
  const listId = `${uid}-cities`;
  const err = (k: string) => errorOf(state, k);

  useEffect(() => {
    if (state?.ok) onDone(state.message);
  }, [state, onDone]);

  return (
    <form {...formProps} className="flex flex-col gap-4" noValidate>
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label" htmlFor={`${uid}-label`} optional hint="e.g. Home, Nani's house" error={err("label")}>
          <Input id={`${uid}-label`} name="label" maxLength={40} defaultValue={initial?.label ?? ""} />
        </Field>
        <Field label="Full name" htmlFor={`${uid}-name`} error={err("fullName")}>
          <Input id={`${uid}-name`} name="fullName" autoComplete="name" required defaultValue={initial?.fullName ?? defaultName ?? ""} aria-invalid={!!err("fullName")} />
        </Field>
        <Field label="Mobile number" htmlFor={`${uid}-phone`} error={err("phone")}>
          <Input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" required defaultValue={initial?.phone ?? defaultPhone ?? ""} aria-invalid={!!err("phone")} />
        </Field>
        <Field label="City" htmlFor={`${uid}-city`} error={err("city")}>
          <Input id={`${uid}-city`} name="city" list={listId} autoComplete="address-level2" required defaultValue={initial?.city ?? ""} aria-invalid={!!err("city")} />
          <datalist id={listId}>
            {PK_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Street address" htmlFor={`${uid}-l1`} className="sm:col-span-2" error={err("line1")} hint="House / flat number, street, area">
          <Input id={`${uid}-l1`} name="line1" autoComplete="address-line1" required defaultValue={initial?.line1 ?? ""} aria-invalid={!!err("line1")} />
        </Field>
        <Field label="Apartment, landmark" htmlFor={`${uid}-l2`} optional error={err("line2")}>
          <Input id={`${uid}-l2`} name="line2" autoComplete="address-line2" defaultValue={initial?.line2 ?? ""} />
        </Field>
        <Field label="Postal code" htmlFor={`${uid}-zip`} optional error={err("postalCode")}>
          <Input id={`${uid}-zip`} name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={5} defaultValue={initial?.postalCode ?? ""} aria-invalid={!!err("postalCode")} />
        </Field>
      </div>
      <Checkbox name="isDefault" label="Use as my default delivery address" defaultChecked={initial?.isDefault ?? false} />
      {state && !state.ok && <Notice state={state} />}
      <div className="flex flex-wrap gap-3 pt-1">
        <Submit pending={pending}>{initial?.id ? "Save changes" : "Save address"}</Submit>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
