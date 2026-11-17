"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertStaff } from "@/lib/auth";
import { renderTokens } from "@/lib/cms";
import { getSettings } from "@/lib/settings";
import { fieldErrors, type ActionResult } from "@/lib/action-result";

/** Pages the storefront links to directly — they can be edited but not deleted or renamed. */
const CORE_SLUGS = ["shipping", "returns", "faq", "contact", "privacy", "terms", "about"];
/** Slugs that would collide with storefront routes or confuse visitors. */
const RESERVED = ["admin", "account", "api", "cart", "checkout", "shop", "search", "media", "products", "collections", "wishlist"];

const schema = z.object({
  title: z.string().trim().min(2, "Add a title.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Add a URL slug.")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single dashes only."),
  body: z.string().max(50_000, "This page is too long."),
  seoDescription: z.string().trim().max(200).optional(),
  isPublished: z.boolean(),
  showInFooter: z.boolean(),
});

function storefrontPath(slug: string) {
  return slug === "about" ? "/about" : `/pages/${slug}`;
}

export async function savePageAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertStaff();
  } catch {
    return { ok: false, message: "Not authorised" };
  }
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    body: String(formData.get("body") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    isPublished: formData.get("isPublished") === "on",
    showInFooter: formData.get("showInFooter") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form.", errors: fieldErrors(parsed.error.issues) };
  const d = parsed.data;
  if (RESERVED.includes(d.slug)) return { ok: false, message: "That URL is reserved by the store. Choose another slug.", errors: { slug: ["Reserved"] } };

  const existing = id ? await db.page.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "This page no longer exists." };
  if (existing && CORE_SLUGS.includes(existing.slug) && d.slug !== existing.slug) {
    return { ok: false, message: "The URL of this core page can't be changed because the store links to it.", errors: { slug: ["Locked"] } };
  }
  const clash = await db.page.findUnique({ where: { slug: d.slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another page already uses this URL.", errors: { slug: ["Already in use"] } };

  const data = { ...d, seoDescription: d.seoDescription || null };
  const page = existing ? await db.page.update({ where: { id }, data }) : await db.page.create({ data });

  revalidatePath("/", "layout");
  revalidatePath(storefrontPath(page.slug));
  if (existing && existing.slug !== page.slug) revalidatePath(storefrontPath(existing.slug));
  revalidatePath("/admin/pages");
  if (!existing) redirect(`/admin/pages/${page.id}?created=1`);
  return { ok: true, message: "Page saved." };
}

export async function deletePageAction(formData: FormData) {
  await assertStaff();
  const id = String(formData.get("id") ?? "");
  const page = await db.page.findUnique({ where: { id } });
  if (page && !CORE_SLUGS.includes(page.slug)) {
    await db.page.delete({ where: { id } });
    revalidatePath("/", "layout");
    revalidatePath(storefrontPath(page.slug));
  }
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

/** Render {{tokens}} with live settings so the preview matches the storefront. */
export async function previewPageAction(body: string): Promise<string> {
  await assertStaff();
  return renderTokens(String(body).slice(0, 50_000), await getSettings());
}
