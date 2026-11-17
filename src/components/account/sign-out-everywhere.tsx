"use client";

import { LogOut } from "lucide-react";
import { signOutEverywhereAction } from "@/actions/account";
import { Submit } from "./form-status";

export function SignOutEverywhere() {
  return (
    <form
      action={signOutEverywhereAction}
      onSubmit={(e) => {
        if (!confirm("Sign out of Kinder Thread on every device, including this one?")) e.preventDefault();
      }}
    >
      <Submit variant="secondary" size="sm">
        <LogOut className="h-4 w-4" /> Sign out of all devices
      </Submit>
    </form>
  );
}
