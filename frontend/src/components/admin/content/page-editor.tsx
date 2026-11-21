"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { previewPageAction, savePageAction } from "@/actions/admin/content-pages";
import { FormMessage } from "@/components/admin/form-bits";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { cn, slugify } from "@/lib/utils";
import { useFormAction } from "./use-form-action";

const TOKENS: [string, string][] = [
  ["{{flatRate}}", "Delivery charge"],
  ["{{freeThreshold}}", "Free-delivery amount"],
  ["{{estimate}}", "Delivery time"],
  ["{{dispatchNote}}", "Dispatch note"],
  ["{{returnDays}}", "Return window (days)"],
  ["{{email}}", "Store email"],
  ["{{phone}}", "Store phone"],
  ["{{whatsapp}}", "WhatsApp number"],
  ["{{storeName}}", "Store name"],
  ["{{contactBlock}}", "All contact details as a list"],
];

export type PageData = { id?: string; title: string; slug: string; body: string; seoDescription: string | null; isPublished: boolean; showInFooter: boolean };

export function PageEditor({ page, slugLocked }: { page: PageData; slugLocked?: boolean }) {
  const [state, onSubmit, pending] = useFormAction(savePageAction, null);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [slugTouched, setSlugTouched] = useState(!!page.id);
  const [body, setBody] = useState(page.body);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [preview, setPreview] = useState("");
  const [loading, start] = useTransition();
  const err = (k: string) => (state && !state.ok ? state.errors?.[k] : undefined);
  const publicPath = slug === "about" ? "/about" : `/pages/${slug || "your-page"}`;

  const showPreview = () => {
    setTab("preview");
    start(async () => setPreview(await previewPageAction(body)));
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_300px]">
      {page.id && <input type="hidden" name="id" value={page.id} />}
      <div className="flex flex-col gap-4">
        <Field label="Title" htmlFor="pg-title" error={err("title")}>
          <Input
            id="pg-title"
            name="title"
            value={title}
            maxLength={120}
            required
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="URL" htmlFor="pg-slug" error={err("slug")} hint={slugLocked ? "This core page's URL is fixed because the store links to it." : <>Visitors will find it at <code className="text-cocoa">{publicPath}</code></>}>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-cocoa-400">{slug === "about" ? "/" : "/pages/"}</span>
            <Input
              id="pg-slug"
              name="slug"
              value={slug}
              readOnly={slugLocked}
              maxLength={60}
              required
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
            />
          </div>
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-cocoa-600">Content</span>
            <div className="inline-flex rounded-full bg-cocoa-50 p-1 text-[0.8rem] font-semibold" role="tablist">
              <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={cn("rounded-full px-3 py-1", tab === "write" && "bg-white shadow-soft")}>
                Write
              </button>
              <button type="button" role="tab" aria-selected={tab === "preview"} onClick={showPreview} className={cn("rounded-full px-3 py-1", tab === "preview" && "bg-white shadow-soft")}>
                Preview
              </button>
            </div>
          </div>
          <Textarea
            name="body"
            aria-label="Page content (Markdown)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={22}
            className={cn("font-mono text-[0.85rem] leading-relaxed", tab !== "write" && "hidden")}
          />
          {tab === "preview" && (
            <div className="min-h-[24rem] rounded-lg border border-[var(--adm-line)] bg-[#fbfaf8] p-6">
              {loading ? (
                <p className="text-sm text-cocoa-400">Rendering preview…</p>
              ) : (
                <>
                  <h1 className="display-md mb-6">{title}</h1>
                  <div className="prose-kt">
                    <ReactMarkdown>{preview}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          )}
          {err("body") && <p className="mt-1 text-[0.8rem] text-coral-700">{err("body")?.[0]}</p>}
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--adm-line)] bg-white shadow-[0_1px_2px_rgb(20_16_12/0.04)] p-5">
          <div className="flex flex-col gap-3">
            <Checkbox name="isPublished" defaultChecked={page.isPublished} label={<span className="font-semibold text-cocoa">Published</span>} />
            <Checkbox name="showInFooter" defaultChecked={page.showInFooter} label={<span className="font-semibold text-cocoa">Link in footer</span>} />
          </div>
          <Field label="Search description" htmlFor="pg-seo" optional className="mt-4" hint="Shown by Google under the page title. ~150 characters.">
            <Textarea id="pg-seo" name="seoDescription" rows={3} maxLength={200} defaultValue={page.seoDescription ?? ""} />
          </Field>
          <FormMessage state={state} className="mt-4" />
          <Button type="submit" className="mt-4 w-full" loading={pending}>
            {page.id ? "Save page" : "Create page"}
          </Button>
          {page.id && page.isPublished && (
            <a href={publicPath} target="_blank" className="mt-3 block text-center text-sm font-semibold text-sage-700 hover:underline">
              View on store ↗
            </a>
          )}
        </div>
        <div className="rounded-2xl bg-cream-100 p-5 text-[0.82rem] text-cocoa-600">
          <p className="mb-2 font-bold text-cocoa">Formatting</p>
          <p>
            <code>## Heading</code> · <code>**bold**</code> · <code>- list item</code> · <code>[link](/shop)</code> · <code>&gt; note</code>
          </p>
          <p className="mt-4 mb-2 font-bold text-cocoa">Live values</p>
          <p className="mb-2">These are replaced with your current settings, so policies never go out of date:</p>
          <ul className="space-y-1">
            {TOKENS.map(([t, d]) => (
              <li key={t}>
                <button type="button" className="font-mono text-[0.78rem] text-sage-700 hover:underline" onClick={() => setBody((b) => `${b}${t}`)} title="Append to content">
                  {t}
                </button>{" "}
                — {d}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </form>
  );
}
