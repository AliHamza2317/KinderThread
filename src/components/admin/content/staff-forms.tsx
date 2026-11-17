"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changeMyPasswordAction, createStaffAction, resetStaffPasswordAction, setStaffActiveAction, setStaffRoleAction } from "@/actions/admin/content-staff";
import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";
import { useFormAction } from "./use-form-action";

function suggestPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function CreateStaffForm() {
  const [state, onSubmit, pending] = useFormAction(createStaffAction, null);
  const [pw, setPw] = useState("");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      ref.current?.reset();
      setPw("");
    }
  }, [state]);
  const err = (k: string) => (state && !state.ok ? state.errors?.[k] : undefined);
  return (
    <form ref={ref} onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4">
        <Field label="Full name" htmlFor="st-name" error={err("name")}>
          <Input id="st-name" name="name" required maxLength={80} autoComplete="off" />
        </Field>
        <Field label="Email" htmlFor="st-email" error={err("email")}>
          <Input id="st-email" name="email" type="email" required autoComplete="off" />
        </Field>
        <Field label="Role" htmlFor="st-role" hint="Staff manage products and orders. Administrators can also change settings and staff.">
          <Select id="st-role" name="role" defaultValue="STAFF">
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrator</option>
          </Select>
        </Field>
        <Field label="Temporary password" htmlFor="st-pw" error={err("password")} hint="At least 10 characters. Share it privately.">
          <div className="flex gap-2">
            <Input id="st-pw" name="password" type="text" minLength={10} required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" className="font-mono" />
            <Button type="button" variant="secondary" size="sm" className="h-12 shrink-0" onClick={() => setPw(suggestPassword())}>
              Generate
            </Button>
          </div>
        </Field>
      </div>
      <FormMessage state={state} />
      <div>
        <Button type="submit" loading={pending}>
          Create staff account
        </Button>
      </div>
    </form>
  );
}

export type StaffRow = { id: string; name: string; email: string; role: "ADMIN" | "STAFF" | "CUSTOMER"; isActive: boolean; lastLoginAt: string | null; createdAt: string };

export function StaffCard({ member, isSelf }: { member: StaffRow; isSelf: boolean }) {
  const [roleState, roleAction] = useActionState(setStaffRoleAction, null);
  const [activeState, activeAction] = useActionState(setStaffActiveAction, null);
  const [pwState, pwAction] = useActionState(resetStaffPasswordAction, null);
  const [showReset, setShowReset] = useState(false);
  const [pw, setPw] = useState("");

  return (
    <li className="rounded-2xl border border-cocoa-100 bg-cream-50 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-100 font-display text-lg text-sage-700" aria-hidden>
          {member.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {member.name} {isSelf && <span className="text-sm font-normal text-cocoa-500">(you)</span>}
          </p>
          <p className="truncate text-sm text-cocoa-500">{member.email}</p>
          <p className="mt-1 text-[0.78rem] text-cocoa-400">
            Added {formatDate(member.createdAt)} · {member.lastLoginAt ? `last sign-in ${formatDate(member.lastLoginAt, { dateStyle: "medium", timeStyle: "short" })}` : "never signed in"}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Badge tone={member.role === "ADMIN" ? "info" : "neutral"}>{member.role === "ADMIN" ? "Admin" : "Staff"}</Badge>
          {!member.isActive && <Badge tone="danger">Deactivated</Badge>}
        </div>
      </div>

      {!isSelf && (
        <div className="mt-4 flex flex-col gap-3 border-t border-cocoa-100 pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <form action={roleAction} className="flex items-end gap-2">
              <input type="hidden" name="userId" value={member.id} />
              <Field label="Role" htmlFor={`role-${member.id}`}>
                <Select id={`role-${member.id}`} name="role" defaultValue={member.role} className="h-10 w-48 text-sm">
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="CUSTOMER">Remove admin access</option>
                </Select>
              </Field>
              <SubmitButton size="sm" variant="secondary" pendingLabel="Saving…">
                Update
              </SubmitButton>
            </form>
            <form action={activeAction}>
              <input type="hidden" name="userId" value={member.id} />
              <input type="hidden" name="active" value={member.isActive ? "false" : "true"} />
              <SubmitButton size="sm" variant={member.isActive ? "ghost" : "secondary"} className={member.isActive ? "text-coral-700" : ""} pendingLabel="Saving…">
                {member.isActive ? "Deactivate" : "Reactivate"}
              </SubmitButton>
            </form>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowReset((v) => !v)} aria-expanded={showReset}>
              Reset password
            </Button>
          </div>
          {showReset && (
            <form action={pwAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={member.id} />
              <Field label="New temporary password" htmlFor={`pw-${member.id}`} hint="They'll be signed out everywhere.">
                <div className="flex gap-2">
                  <Input id={`pw-${member.id}`} name="password" minLength={10} required value={pw} onChange={(e) => setPw(e.target.value)} className="h-10 w-56 font-mono text-sm" autoComplete="new-password" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPw(suggestPassword())}>
                    Generate
                  </Button>
                </div>
              </Field>
              <SubmitButton size="sm" pendingLabel="Saving…">
                Set password
              </SubmitButton>
            </form>
          )}
          <FormMessage state={roleState ?? null} />
          <FormMessage state={activeState ?? null} />
          <FormMessage state={pwState ?? null} />
        </div>
      )}
    </li>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changeMyPasswordAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const err = (k: string) => (state && !state.ok ? state.errors?.[k] : undefined);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Current password" htmlFor="cp-current" error={err("current")}>
          <Input id="cp-current" name="current" type="password" autoComplete="current-password" required />
        </Field>
        <Field label="New password" htmlFor="cp-next" error={err("next")} hint="At least 10 characters">
          <Input id="cp-next" name="next" type="password" autoComplete="new-password" minLength={10} required />
        </Field>
        <Field label="Confirm new password" htmlFor="cp-confirm" error={err("confirm")}>
          <Input id="cp-confirm" name="confirm" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
      </div>
    </form>
  );
}
