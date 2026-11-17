"use server";

import { redirect } from "next/navigation";
import { assertStaff } from "@/lib/auth";

/*
 * Frontend-only build: subscriber changes aren't saved. These keep the same
 * signatures as the real actions so the forms work unchanged and send the
 * admin back to the list with a demo notice.
 */
export async function setSubscriberActiveAction(_formData: FormData) {
  await assertStaff();
  redirect("/admin/newsletter?demo=1");
}

export async function deleteSubscriberAction(_formData: FormData) {
  await assertStaff();
  redirect("/admin/newsletter?demo=1");
}
