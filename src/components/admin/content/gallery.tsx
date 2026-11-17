"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImagesAction } from "@/actions/admin/upload";
import { addGalleryImagesAction, deleteGalleryImageAction, updateGalleryImageAction } from "@/actions/admin/content";
import { ConfirmSubmit, FormMessage } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { toast } from "@/stores/toast";
import { useFormAction } from "./use-form-action";

export type GalleryRow = { id: string; url: string; alt: string; href: string | null; sortOrder: number; isActive: boolean; isSample: boolean };

function GalleryItem({ img }: { img: GalleryRow }) {
  const [state, onSubmit, pending] = useFormAction(updateGalleryImageAction, null);
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-cocoa-100 bg-cream-50 p-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-100">
        <Image src={img.url} alt={img.alt} fill sizes="240px" className="object-cover" />
        <div className="absolute top-2 left-2 flex gap-1">
          {!img.isActive && <Badge tone="neutral">Hidden</Badge>}
          {img.isSample && <Badge tone="sample">Sample</Badge>}
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={img.id} />
        <label className="sr-only" htmlFor={`g-alt-${img.id}`}>
          Alt text
        </label>
        <Input id={`g-alt-${img.id}`} name="alt" defaultValue={img.alt} placeholder="Describe the image" maxLength={200} className="h-10 text-sm" />
        <label className="sr-only" htmlFor={`g-href-${img.id}`}>
          Link
        </label>
        <Input id={`g-href-${img.id}`} name="href" defaultValue={img.href ?? ""} placeholder="Link (optional), e.g. Instagram post" className="h-10 text-sm" />
        <div className="flex items-center gap-2">
          <label className="text-[0.78rem] font-semibold text-cocoa-500" htmlFor={`g-sort-${img.id}`}>
            Order
          </label>
          <Input id={`g-sort-${img.id}`} name="sortOrder" type="number" min={0} max={999} defaultValue={img.sortOrder} className="h-10 w-20 text-sm" />
        </div>
        <Checkbox name="isActive" defaultChecked={img.isActive} label="Visible" />
        <Checkbox name="isSample" defaultChecked={img.isSample} label="Sample imagery (shows label)" />
        <FormMessage state={state} className="py-2 text-xs" />
        <Button type="submit" size="sm" variant="secondary" loading={pending}>
          Save
        </Button>
      </form>
      <form action={deleteGalleryImageAction}>
        <input type="hidden" name="id" value={img.id} />
        <ConfirmSubmit message="Delete this gallery image?" variant="ghost" className="w-full text-coral-700">
          Delete
        </ConfirmSubmit>
      </form>
    </li>
  );
}

export function GalleryManager({ images }: { images: GalleryRow[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("folder", "gallery");
    Array.from(files)
      .slice(0, 12)
      .forEach((f) => fd.append("files", f));
    const up = await uploadImagesAction(fd);
    if (!up.ok) {
      toast({ title: "Upload failed", description: up.message, tone: "error" });
    } else {
      const res = await addGalleryImagesAction(up.urls);
      toast({ title: res?.ok ? "Images added" : "Could not add images", description: res?.message, tone: res?.ok ? "success" : "error" });
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {busy ? "Uploading…" : "Upload images"}
        </Button>
        <p className="text-[0.8rem] text-cocoa-500">JPG, PNG or WebP · up to 12 at once · 10 MB each. Square images work best.</p>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onPick(e.target.files)} />
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-cocoa-500">No gallery images yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {images.map((img) => (
            <GalleryItem key={img.id} img={img} />
          ))}
        </ul>
      )}
    </div>
  );
}
