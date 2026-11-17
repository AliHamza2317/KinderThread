"use server";

import { assertStaff } from "@/lib/auth";
import { storeImage } from "@/lib/storage";

export type UploadResult = { ok: true; urls: string[] } | { ok: false; message: string };

/** Upload one or more images (field name "files"). Returns their public URLs. */
export async function uploadImagesAction(formData: FormData): Promise<UploadResult> {
  try {
    await assertStaff();
    const folder = String(formData.get("folder") ?? "misc").replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) return { ok: false, message: "Choose at least one image." };
    if (files.length > 12) return { ok: false, message: "Upload up to 12 images at a time." };
    const urls: string[] = [];
    for (const f of files) urls.push((await storeImage(f, folder)).url);
    return { ok: true, urls };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }
}
