"use server";

import { z } from "zod";
import { BANNERS, GALLERY } from "@/data/content";
import { assertStaff } from "@/lib/auth";
import { demoResult } from "@/lib/demo";
import { getSettings, saveSetting, settingSchemas, type SettingKey } from "@/lib/settings";
import { fieldErrors, type ActionResult } from "@/lib/action-result";

/* ---------------------------------------------------------------------------
   Settings & homepage content
   --------------------------------------------------------------------------- */

/** Keys any staff member may edit (marketing). Everything else is ADMIN-only. */
const MARKETING_KEYS: SettingKey[] = ["announcement", "home"];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge `patch` into `base`. Arrays and primitives in the patch replace the base value. */
function deepMerge(base: unknown, patch: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch === undefined ? base : patch;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = deepMerge(base[k], v);
  return out;
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cur[parts[i]];
    if (!isPlainObject(next)) cur[parts[i]] = {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts.at(-1)!] = value;
}

/**
 * Save a partial update for one settings key.
 * FormData: key, payload (JSON patch), and optional `img:<path>` entries from ImageInput.
 */
export async function saveSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const key = String(formData.get("key") ?? "") as SettingKey;
  if (!(key in settingSchemas)) return { ok: false, message: "Unknown settings section." };
  try {
    await assertStaff({ adminOnly: !MARKETING_KEYS.includes(key) });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Not authorised" };
  }

  let patch: Record<string, unknown>;
  try {
    const raw = JSON.parse(String(formData.get("payload") ?? "{}"));
    if (!isPlainObject(raw)) throw new Error();
    patch = raw;
  } catch {
    return { ok: false, message: "Could not read the form. Please reload and try again." };
  }
  for (const [name, value] of formData.entries()) {
    if (name.startsWith("img:") && typeof value === "string") setPath(patch, name.slice(4), value);
  }

  const current = await getSettings();
  const merged = deepMerge(current[key], patch) as Record<string, unknown>;

  // Guard-rails: features that are not production-ready cannot be switched on from the UI.
  if (key === "payments" && isPlainObject(merged.card)) merged.card = { ...merged.card, enabled: false };
  if (key === "features") merged.tryOn = false;
  if (key === "announcement" && Array.isArray(merged.messages)) {
    merged.messages = (merged.messages as { text?: string; href?: string }[])
      .map((m) => ({ text: String(m.text ?? "").trim(), href: String(m.href ?? "").trim() }))
      .filter((m) => m.text);
  }

  const parsed = settingSchemas[key].safeParse(merged);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error.issues);
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: `Please check “${first?.path.join(".") || "the form"}”: ${first?.message ?? "invalid value"}`,
      errors,
    };
  }
  await saveSetting(key, parsed.data);
  return demoResult();
}

/* ---------------------------------------------------------------------------
   Banners
   --------------------------------------------------------------------------- */

const optionalHref = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Links must start with / or https://");

const bannerSchema = z.object({
  eyebrow: z.string().trim().max(60).optional(),
  title: z.string().trim().min(1, "Title is required").max(120),
  subtitle: z.string().trim().max(300).optional(),
  image: z.string().trim().max(500).optional(),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaHref: optionalHref.optional(),
  tone: z.enum(["sage", "sun", "coral", "cream"]),
  sortOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
});

function bannerFromForm(fd: FormData) {
  const s = (k: string) => String(fd.get(k) ?? "");
  return bannerSchema.safeParse({
    eyebrow: s("eyebrow"),
    title: s("title"),
    subtitle: s("subtitle"),
    image: s("image"),
    ctaLabel: s("ctaLabel"),
    ctaHref: s("ctaHref"),
    tone: s("tone") || "sage",
    sortOrder: s("sortOrder") || "0",
    isActive: fd.get("isActive") === "on",
  });
}

export async function saveBannerAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
  } catch {
    return { ok: false, message: "Not authorised" };
  }
  const parsed = bannerFromForm(formData);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  const d = parsed.data;
  if (d.ctaLabel && !d.ctaHref) return { ok: false, message: "Add a link for the button, or clear the button label." };
  const id = String(formData.get("id") ?? "");
  if (id && !BANNERS.some((b) => b.id === id)) return { ok: false, message: "This banner no longer exists." };
  return demoResult();
}

/** Demo build: nothing is deleted (the form simply re-renders). */
export async function deleteBannerAction(_formData: FormData) {
  await assertStaff();
}

/* ---------------------------------------------------------------------------
   Gallery
   --------------------------------------------------------------------------- */

export async function addGalleryImagesAction(urls: string[]): Promise<ActionResult> {
  try {
    await assertStaff();
  } catch {
    return { ok: false, message: "Not authorised" };
  }
  const clean = z.array(z.string().min(1).max(500)).min(1).max(12).safeParse(urls);
  if (!clean.success) return { ok: false, message: "Nothing to add." };
  return demoResult();
}

const galleryUpdateSchema = z.object({
  id: z.string().min(1).max(40),
  alt: z.string().trim().max(200),
  href: optionalHref,
  sortOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
  isSample: z.boolean(),
});

export async function updateGalleryImageAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
  } catch {
    return { ok: false, message: "Not authorised" };
  }
  const parsed = galleryUpdateSchema.safeParse({
    id: formData.get("id"),
    alt: String(formData.get("alt") ?? ""),
    href: String(formData.get("href") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on",
    isSample: formData.get("isSample") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  if (!GALLERY.some((g) => g.id === parsed.data.id)) return { ok: false, message: "This image no longer exists." };
  return demoResult();
}

/** Demo build: nothing is deleted. */
export async function deleteGalleryImageAction(_formData: FormData) {
  await assertStaff();
}
