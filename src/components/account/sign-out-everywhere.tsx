"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { signOutEverywhereAction } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toast";

export function SignOutEverywhere() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={() => {
        if (!confirm("Sign out of Kinder Thread on every device, including this one?")) return;
        start(async () => {
          const res = await signOutEverywhereAction();
          if (res?.message) toast({ title: "Not saved", description: res.message, tone: "info" });
        });
      }}
    >
      <LogOut className="h-4 w-4" /> Sign out of all devices
    </Button>
  );
}
