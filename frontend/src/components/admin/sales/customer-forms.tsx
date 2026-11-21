"use client";

import { setCustomerActiveAction, updateCustomerTagsAction } from "@/actions/admin/sales";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/form-bits";
import { Input } from "@/components/ui/field";
import { ActionForm } from "./action-form";

export function TagsForm({ userId, tags }: { userId: string; tags: string[] }) {
  return (
    <ActionForm action={updateCustomerTagsAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <label htmlFor="tags" className="text-[0.82rem] font-semibold text-cocoa-600">
        Tags <span className="font-normal text-cocoa-400">(comma separated)</span>
      </label>
      <Input id="tags" name="tags" defaultValue={tags.join(", ")} placeholder="e.g. twins, wholesale, lahore" />
      <SubmitButton size="sm" variant="secondary" className="self-start">
        Save tags
      </SubmitButton>
    </ActionForm>
  );
}

export function ActiveToggle({ userId, active, name }: { userId: string; active: boolean; name: string }) {
  return (
    <ActionForm action={setCustomerActiveAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      {active ? (
        <ConfirmSubmit message={`Disable ${name}'s account? They will be signed out and won't be able to sign in until re-enabled.`} variant="danger">
          Disable account
        </ConfirmSubmit>
      ) : (
        <SubmitButton size="sm">Enable account</SubmitButton>
      )}
    </ActionForm>
  );
}
