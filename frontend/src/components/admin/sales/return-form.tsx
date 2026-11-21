"use client";

import { useState } from "react";
import { updateReturnAction } from "@/actions/admin/sales";
import { SubmitButton } from "@/components/admin/form-bits";
import { Checkbox, Field, Select, Textarea } from "@/components/ui/field";
import type { ReturnStatus, ReturnType } from "@/lib/types";
import { ActionForm } from "./action-form";
import { RETURN_NEXT, RETURN_STATUS_LABEL } from "./labels";

export function ReturnUpdateForm({
  id,
  status,
  type,
  adminNote,
  orderReturnable,
}: {
  id: string;
  status: ReturnStatus;
  type: ReturnType;
  adminNote: string | null;
  orderReturnable: boolean;
}) {
  const options = RETURN_NEXT[status];
  const [next, setNext] = useState<string>("");
  const completingReturn = next === "COMPLETED" && type === "RETURN";
  return (
    <ActionForm action={updateReturnAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      {options.length > 0 ? (
        <Field label="Next step" htmlFor="ret-status">
          <Select id="ret-status" name="status" value={next} onChange={(e) => setNext(e.target.value)}>
            <option value="">Keep as “{RETURN_STATUS_LABEL[status]}”</option>
            {options.map((s) => (
              <option key={s} value={s}>
                {RETURN_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <p className="rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-800">This request is complete. You can still update the internal note.</p>
      )}
      {completingReturn && (
        <div className="flex flex-col gap-2 rounded-xl bg-cream-100 p-4">
          {orderReturnable ? (
            <>
              <Checkbox name="markOrderReturned" defaultChecked label="Mark the order as returned" />
              <Checkbox name="restock" defaultChecked label="Add returned items back to stock" />
            </>
          ) : (
            <p className="text-[0.82rem] text-cocoa-500">The order isn&apos;t shipped/delivered, so its status won&apos;t change.</p>
          )}
        </div>
      )}
      <Field label="Internal note" htmlFor="adminNote" optional hint="Staff only — not shown to the customer.">
        <Textarea id="adminNote" name="adminNote" defaultValue={adminNote ?? ""} maxLength={1000} className="min-h-24" />
      </Field>
      <SubmitButton size="sm" className="self-start">
        Save
      </SubmitButton>
    </ActionForm>
  );
}
