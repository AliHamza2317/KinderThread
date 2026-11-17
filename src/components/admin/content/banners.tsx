"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { deleteBannerAction, saveBannerAction } from "@/actions/admin/content";
import { ConfirmSubmit, FormMessage } from "@/components/admin/form-bits";
import { ImageInput } from "@/components/admin/image-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useFormAction } from "./use-form-action";

export type BannerRow = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  image: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: string;
  sortOrder: number;
  isActive: boolean;
};

const TONES: Record<string, string> = { sage: "bg-sage-100", sun: "bg-sun-100", coral: "bg-coral-100", cream: "bg-cream-200" };

function BannerForm({ banner, onDone }: { banner?: BannerRow; onDone?: () => void }) {
  const [state, onSubmit, pending] = useFormAction(saveBannerAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = banner?.id ?? "new";
  useEffect(() => {
    if (state?.ok && !banner) {
      formRef.current?.reset();
      onDone?.();
    }
  }, [state, banner, onDone]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <ImageInput name="image" label="Image" folder="banners" defaultValue={banner?.image} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" htmlFor={`bn-eyebrow-${id}`} optional>
            <Input id={`bn-eyebrow-${id}`} name="eyebrow" defaultValue={banner?.eyebrow ?? ""} maxLength={60} placeholder="Collection" />
          </Field>
          <Field label="Title" htmlFor={`bn-title-${id}`} error={state && !state.ok ? state.errors?.title : undefined}>
            <Input id={`bn-title-${id}`} name="title" defaultValue={banner?.title ?? ""} maxLength={120} required />
          </Field>
          <Field label="Subtitle" htmlFor={`bn-sub-${id}`} optional className="sm:col-span-2">
            <Textarea id={`bn-sub-${id}`} name="subtitle" rows={2} defaultValue={banner?.subtitle ?? ""} maxLength={300} />
          </Field>
          <Field label="Button label" htmlFor={`bn-cta-${id}`} optional>
            <Input id={`bn-cta-${id}`} name="ctaLabel" defaultValue={banner?.ctaLabel ?? ""} maxLength={40} placeholder="Shop now" />
          </Field>
          <Field label="Button link" htmlFor={`bn-href-${id}`} optional error={state && !state.ok ? state.errors?.ctaHref : undefined} hint="Start with / for store pages">
            <Input id={`bn-href-${id}`} name="ctaHref" defaultValue={banner?.ctaHref ?? ""} placeholder="/collections/newborn" />
          </Field>
          <Field label="Background tone" htmlFor={`bn-tone-${id}`}>
            <Select id={`bn-tone-${id}`} name="tone" defaultValue={banner?.tone ?? "sage"}>
              <option value="sage">Sage</option>
              <option value="sun">Sunshine</option>
              <option value="coral">Coral</option>
              <option value="cream">Cream</option>
            </Select>
          </Field>
          <Field label="Sort order" htmlFor={`bn-sort-${id}`} hint="Lower numbers show first">
            <Input id={`bn-sort-${id}`} name="sortOrder" type="number" min={0} max={999} defaultValue={banner?.sortOrder ?? 0} />
          </Field>
          <Checkbox name="isActive" defaultChecked={banner?.isActive ?? true} label={<span className="font-semibold text-cocoa">Show on homepage</span>} className="sm:col-span-2" />
        </div>
      </div>
      <FormMessage state={state} />
      <div>
        <Button type="submit" size="sm" loading={pending}>
          {banner ? "Save banner" : "Add banner"}
        </Button>
      </div>
    </form>
  );
}

export function BannersManager({ banners }: { banners: BannerRow[] }) {
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {banners.length === 0 && !adding && <p className="text-sm text-cocoa-500">No banners yet. Banners appear as promotional tiles on the homepage.</p>}
      {banners.map((b) => (
        <div key={b.id} className="rounded-2xl border border-cocoa-100 bg-cream-50">
          <button type="button" className="flex w-full items-center gap-4 p-3 text-left" onClick={() => setOpen(open === b.id ? null : b.id)} aria-expanded={open === b.id}>
            <span className={cn("relative h-16 w-14 shrink-0 overflow-hidden rounded-xl", TONES[b.tone] ?? "bg-cream-200")}>
              {b.image && <Image src={b.image} alt="" fill sizes="56px" className="object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{b.title}</span>
              <span className="block truncate text-[0.8rem] text-cocoa-500">
                {b.ctaHref ? `${b.ctaLabel ?? "Link"} → ${b.ctaHref}` : "No button"} · order {b.sortOrder}
              </span>
            </span>
            <Badge tone={b.isActive ? "success" : "neutral"}>{b.isActive ? "Live" : "Hidden"}</Badge>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open === b.id && "rotate-180")} />
          </button>
          {open === b.id && (
            <div className="border-t border-cocoa-100 p-4">
              <BannerForm banner={b} />
              <form action={deleteBannerAction} className="mt-4 border-t border-cocoa-100 pt-4">
                <input type="hidden" name="id" value={b.id} />
                <ConfirmSubmit message={`Delete the banner “${b.title}”? This cannot be undone.`}>Delete banner</ConfirmSubmit>
              </form>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div className="rounded-2xl border border-cocoa-200 p-4">
          <p className="mb-4 font-semibold">New banner</p>
          <BannerForm onDone={() => setAdding(false)} />
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add banner
          </Button>
        </div>
      )}
    </div>
  );
}
