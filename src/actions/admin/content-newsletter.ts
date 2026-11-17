"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertStaff } from "@/lib/auth";

export async function setSubscriberActiveAction(formData: FormData) {
  await assertStaff();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (id) await db.subscriber.updateMany({ where: { id }, data: { isActive: active } });
  revalidatePath("/admin/newsletter");
}

export async function deleteSubscriberAction(formData: FormData) {
  await assertStaff();
  const id = String(formData.get("id") ?? "");
  if (id) await db.subscriber.deleteMany({ where: { id } });
  revalidatePath("/admin/newsletter");
}
