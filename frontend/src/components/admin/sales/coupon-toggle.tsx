"use client";

import { toggleCouponAction } from "@/actions/admin/sales";
import { SubmitButton } from "@/components/admin/form-bits";
import { ActionForm } from "./action-form";

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  return (
    <ActionForm action={toggleCouponAction} showMessage={false}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <SubmitButton size="sm" variant="ghost">
        {active ? "Pause" : "Activate"}
      </SubmitButton>
    </ActionForm>
  );
}
