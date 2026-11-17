"use client";

import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImagesAction } from "@/actions/admin/upload";
import { cn } from "@/lib/utils";

/**
 * Single-image picker for admin forms. Uploads immediately and stores the
 * resulting URL in a hidden input called `name`.
 */
export function ImageInput({ name, defaultValue, folder = "misc", label = "Image", aspect = "aspect-[4/5]", className }: { name: string; defaultValue?: string | null; folder?: string; label?: string; aspect?: string; className?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("files", files[0]);
    const res = await uploadImagesAction(fd);
    setBusy(false);
    if (res.ok) setUrl(res.urls[0]);
    else setError(res.message);
    if (input.current) input.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[0.82rem] font-semibold text-cocoa-600">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className={cn("relative w-full max-w-[220px] overflow-hidden rounded-2xl border border-dashed border-cocoa-200 bg-cream-100", aspect)}>
        {url ? (
          <>
            <Image src={url} alt="" fill sizes="220px" className="object-cover" />
            <button type="button" onClick={() => setUrl("")} className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-cream-50/90 shadow-soft" aria-label="Remove image">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-cocoa-500 hover:text-cocoa">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            {busy ? "Uploading…" : "Upload image"}
          </button>
        )}
      </div>
      {url && (
        <button type="button" onClick={() => input.current?.click()} className="self-start text-[0.8rem] font-semibold text-sage-700 hover:underline">
          {busy ? "Uploading…" : "Replace"}
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onPick(e.target.files)} />
      {error && <p className="text-[0.8rem] font-medium text-coral-700">{error}</p>}
    </div>
  );
}
