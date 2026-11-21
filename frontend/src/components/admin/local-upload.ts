"use client";

/**
 * Frontend-only build: there is no file storage yet, so picked images are
 * shown as local browser previews (object URLs) and are not uploaded.
 */
export const UPLOAD_NOTE = "Preview only — uploads will be saved once storage is connected.";

const ALLOWED = /^image\/(jpeg|png|webp|avif|gif)$/;
const MAX = 10 * 1024 * 1024;

export function previewFiles(files: FileList | File[] | null, limit = 12) {
  const list = Array.from(files ?? []);
  const accepted = list.filter((f) => ALLOWED.test(f.type) && f.size <= MAX).slice(0, limit);
  return {
    urls: accepted.map((f) => ({ url: URL.createObjectURL(f), name: f.name })),
    skipped: list.length - accepted.length,
  };
}
