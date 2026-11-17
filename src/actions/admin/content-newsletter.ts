"use server";

import { assertStaff } from "@/lib/auth";

/*
 * Frontend-only build: subscriber changes aren't saved. These keep the same
 * signatures as the real actions so the forms work unchanged; the page shows
 * a demo notice instead.
 */
export async function setSubscriberActiveAction(_formData: FormData) {
  await assertStaff();
}

export async function deleteSubscriberAction(_formData: FormData) {
  await assertStaff();
}
