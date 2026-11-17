"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveProductAction, type ProductInput } from "@/actions/admin/catalog";
import { uploadImagesAction } from "@/actions/admin/upload";
import { Card } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { SIZES, sortSizes } from "@/lib/sizes";
import { cn, formatPrice, slugify } from "@/lib/utils";
import { toast } from "@/stores/toast";

export type ProductFormData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string | null;
  care: string | null;
  price: number;
  compareAtPrice: number | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  gender: "BOY" | "GIRL" | "UNISEX";
  categoryIds: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isSample: boolean;
  sizeGuideId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  colors: { id: string; name: string; hex: string }[];
  images: { id: string; url: string; alt: string; colorId: string | null }[];
  variants: { id: string; size: string; colorId: string | null; sku: string; stock: number; price: number | null; isActive: boolean }[];
};

type ColorState = { key: string; id?: string; name: string; hex: string };
type ImageState = { key: string; id?: string; url: string; alt: string; colorKey: string | null };
type Cell = { id?: string; sku: string; stock: string; price: string; isActive: boolean };

const NONE = "none";
const cellKey = (colorKey: string | null, size: string) => `${colorKey ?? NONE}|${size}`;
let tmp = 0;
const newKey = (p: string) => `new-${p}-${Date.now().toString(36)}-${++tmp}`;

function productCode(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const code = words.length >= 2 ? words.slice(0, 3).map((w) => w[0]).join("") : (words[0] ?? "PRD").slice(0, 3);
  return code.toUpperCase() || "PRD";
}
const colorCode = (name?: string) => (name ?? "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
function autoSku(name: string, color: string | undefined, size: string) {
  return ["KT", productCode(name), colorCode(color), size.replace(/[^A-Za-z0-9-]/g, "")].filter(Boolean).join("-");
}

export function ProductForm({
  product,
  categories,
  sizeGuides,
}: {
  product?: ProductFormData;
  categories: { id: string; name: string; kind: string }[];
  sizeGuides: { id: string; name: string; isDefault: boolean }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formError, setFormError] = useState("");

  // ---------------- basic fields
  const [f, setF] = useState(() => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    fabric: product?.fabric ?? "",
    care: product?.care ?? "",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
    status: product?.status ?? ("DRAFT" as ProductFormData["status"]),
    gender: product?.gender ?? ("UNISEX" as ProductFormData["gender"]),
    categoryIds: product?.categoryIds ?? [],
    isFeatured: product?.isFeatured ?? false,
    isNewArrival: product?.isNewArrival ?? !product,
    isBestSeller: product?.isBestSeller ?? false,
    isSample: product?.isSample ?? false,
    sizeGuideId: product?.sizeGuideId ?? sizeGuides.find((g) => g.isDefault)?.id ?? "",
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
  }));
  const [slugTouched, setSlugTouched] = useState(!!product);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setDirty(true);
    setF((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name" && !slugTouched) next.slug = slugify(String(v));
      return next;
    });
  };

  // ---------------- colours
  const [colors, setColors] = useState<ColorState[]>(() => product?.colors.map((c) => ({ key: c.id, id: c.id, name: c.name, hex: c.hex })) ?? []);
  const [newColor, setNewColor] = useState({ name: "", hex: "#8A9E72" });

  // ---------------- images
  const [images, setImages] = useState<ImageState[]>(() => product?.images.map((i) => ({ key: i.id, id: i.id, url: i.url, alt: i.alt, colorKey: i.colorId })) ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---------------- sizes & variants
  const [sizes, setSizes] = useState<string[]>(() => (product ? sortSizes([...new Set(product.variants.map((v) => v.size))]) : []));
  const [customSize, setCustomSize] = useState("");
  const [cells, setCells] = useState<Record<string, Cell>>(() => {
    const out: Record<string, Cell> = {};
    for (const v of product?.variants ?? []) {
      out[cellKey(v.colorId, v.size)] = { id: v.id, sku: v.sku, stock: String(v.stock), price: v.price != null ? String(v.price) : "", isActive: v.isActive };
    }
    return out;
  });
  const [bulkStock, setBulkStock] = useState("");

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const colorKeys: (string | null)[] = colors.length ? colors.map((c) => c.key) : [null];
  const colorName = (key: string | null) => colors.find((c) => c.key === key)?.name;
  const cellFor = (colorKey: string | null, size: string): Cell =>
    cells[cellKey(colorKey, size)] ?? { sku: autoSku(f.name, colorName(colorKey), size), stock: "0", price: "", isActive: true };
  const patchCell = (colorKey: string | null, size: string, patch: Partial<Cell>) => {
    setDirty(true);
    setCells((prev) => ({ ...prev, [cellKey(colorKey, size)]: { ...cellFor(colorKey, size), ...patch } }));
  };

  const totalStock = useMemo(
    () => colorKeys.reduce((n, ck) => n + sizes.reduce((m, s) => m + (Number(cellFor(ck, s).stock) || 0), 0), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cells, sizes, colors, f.name],
  );

  const toggleSize = (s: string) => {
    setDirty(true);
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : sortSizes([...prev, s])));
  };

  const addColor = () => {
    const name = newColor.name.trim();
    if (!name) return;
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "That colour already exists", tone: "error" });
      return;
    }
    const key = newKey("c");
    setDirty(true);
    if (colors.length === 0) {
      // move colour-less variants onto the first colour so stock isn't lost
      setCells((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(prev)) {
          if (k.startsWith(`${NONE}|`)) {
            const size = k.slice(NONE.length + 1);
            next[cellKey(key, size)] = v.id ? v : { ...v, sku: autoSku(f.name, name, size) };
            delete next[k];
          }
        }
        return next;
      });
    }
    setColors((prev) => [...prev, { key, name, hex: newColor.hex }]);
    setNewColor({ name: "", hex: newColor.hex });
  };

  const moveColor = (i: number, dir: -1 | 1) => {
    setDirty(true);
    setColors((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const removeColor = (key: string) => {
    if (!confirm("Remove this colour? Its sizes/stock will be removed when you save.")) return;
    setDirty(true);
    setColors((prev) => prev.filter((c) => c.key !== key));
    setImages((prev) => prev.map((img) => (img.colorKey === key ? { ...img, colorKey: null } : img)));
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("folder", "products");
    Array.from(files).forEach((file) => fd.append("files", file));
    const res = await uploadImagesAction(fd);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) {
      toast({ title: "Upload failed", description: res.message, tone: "error" });
      return;
    }
    setDirty(true);
    setImages((prev) => [...prev, ...res.urls.map((url) => ({ key: newKey("i"), url, alt: f.name, colorKey: null }))]);
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    setDirty(true);
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const err = (k: string) => errors[k]?.[0];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const price = Number(f.price);
    if (f.price.trim() === "" || !Number.isInteger(price) || price < 0) {
      setErrors({ price: ["Enter the price in whole rupees."] });
      setFormError("Enter the price in whole rupees.");
      return;
    }
    const compare = f.compareAtPrice.trim() === "" ? null : Number(f.compareAtPrice);
    const variants: ProductInput["variants"] = [];
    for (const ck of colorKeys) {
      for (const s of sizes) {
        const c = cellFor(ck, s);
        variants.push({
          id: c.id,
          size: s,
          colorKey: ck,
          sku: c.sku.trim(),
          stock: Math.max(0, Math.floor(Number(c.stock) || 0)),
          price: c.price.trim() === "" ? null : Math.floor(Number(c.price)),
          isActive: c.isActive,
        });
      }
    }
    const payload: ProductInput = {
      id: product?.id,
      name: f.name,
      slug: slugify(f.slug || f.name),
      description: f.description,
      fabric: f.fabric,
      care: f.care,
      price,
      compareAtPrice: compare != null && Number.isFinite(compare) ? Math.floor(compare) : null,
      status: f.status,
      gender: f.gender,
      categoryIds: f.categoryIds,
      isFeatured: f.isFeatured,
      isNewArrival: f.isNewArrival,
      isBestSeller: f.isBestSeller,
      isSample: f.isSample,
      sizeGuideId: f.sizeGuideId || null,
      seoTitle: f.seoTitle,
      seoDescription: f.seoDescription,
      colors: colors.map((c) => ({ id: c.id, key: c.key, name: c.name, hex: c.hex })),
      images: images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, colorKey: i.colorKey })),
      variants,
    };
    start(async () => {
      const res = await saveProductAction(payload);
      if (!res) return;
      if (!res.ok) {
        setErrors(res.errors ?? {});
        setFormError(res.message);
        toast({ title: "Couldn't save product", description: res.message, tone: "error" });
        return;
      }
      setErrors({});
      setDirty(false);
      toast({ title: res.message ?? "Saved" });
      if (!product && res.data) router.push(`/admin/products/${res.data.id}?created=1`);
      else router.refresh();
    });
  };

  const variantErrors = Object.entries(errors).filter(([k]) => k.startsWith("variants"));

  return (
    <form onSubmit={onSubmit} className="pb-28" noValidate>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ---------------- Details */}
          <Card title="Details">
            <div className="grid gap-4">
              <Field label="Product name" htmlFor="name" error={err("name")}>
                <Input id="name" value={f.name} onChange={(e) => set("name", e.target.value)} required maxLength={140} aria-invalid={!!err("name")} />
              </Field>
              <Field label="URL slug" htmlFor="slug" error={err("slug")} hint={<>Shop URL: /products/{slugify(f.slug || f.name) || "…"}</>}>
                <Input
                  id="slug"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  aria-invalid={!!err("slug")}
                />
              </Field>
              <Field label="Description" htmlFor="description" error={err("description")}>
                <Textarea id="description" rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!err("description")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fabric" htmlFor="fabric" optional hint="e.g. Soft cotton jersey">
                  <Input id="fabric" value={f.fabric} onChange={(e) => set("fabric", e.target.value)} />
                </Field>
                <Field label="Care instructions" htmlFor="care" optional>
                  <Input id="care" value={f.care} onChange={(e) => set("care", e.target.value)} placeholder="Machine wash cold…" />
                </Field>
              </div>
            </div>
          </Card>

          {/* ---------------- Pricing */}
          <Card title="Pricing" description="Whole Pakistani rupees. Add a compare-at price to show a discount.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (Rs.)" htmlFor="price" error={err("price")}>
                <Input id="price" inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!err("price")} />
              </Field>
              <Field label="Compare-at price (Rs.)" htmlFor="compare" optional error={err("compareAtPrice")} hint="Original price before discount">
                <Input id="compare" inputMode="numeric" value={f.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!err("compareAtPrice")} />
              </Field>
            </div>
            {f.price && f.compareAtPrice && Number(f.compareAtPrice) > Number(f.price) && (
              <p className="mt-3 text-sm text-sage-700">
                Shows as {formatPrice(Number(f.price))} <span className="text-cocoa-400 line-through">{formatPrice(Number(f.compareAtPrice))}</span> · −
                {Math.round(((Number(f.compareAtPrice) - Number(f.price)) / Number(f.compareAtPrice)) * 100)}%
              </p>
            )}
          </Card>

          {/* ---------------- Images */}
          <Card
            title="Images"
            description="The first image is the main image; the second appears on hover. Assign images to a colour so shoppers see the right photo."
            actions={
              <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading}>
                <ImagePlus className="h-4 w-4" /> Upload
              </Button>
            }
          >
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onUpload(e.target.files)} />
            {images.length === 0 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="stitch-border flex w-full flex-col items-center justify-center gap-2 rounded-2xl px-6 py-12 text-sm font-semibold text-cocoa-500 hover:text-cocoa"
              >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                {uploading ? "Uploading…" : "Upload product photos (JPG, PNG, WebP · up to 10 MB each)"}
              </button>
            ) : (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {images.map((img, i) => (
                  <li key={img.key} className="flex flex-col gap-2">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-100">
                      <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                      {i === 0 && (
                        <span className="absolute top-2 left-2">
                          <Badge tone="new">Main</Badge>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDirty(true);
                          setImages((prev) => prev.filter((x) => x.key !== img.key));
                        }}
                        className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-cream-50/95 shadow-soft hover:bg-white"
                        aria-label={`Remove image ${i + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute right-2 bottom-2 flex gap-1">
                        <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)} className="grid h-8 w-8 place-items-center rounded-full bg-cream-50/95 shadow-soft disabled:opacity-40" aria-label="Move image earlier">
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} className="grid h-8 w-8 place-items-center rounded-full bg-cream-50/95 shadow-soft disabled:opacity-40" aria-label="Move image later">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <Input
                      className="h-9 rounded-xl px-3 text-[0.8rem]"
                      value={img.alt}
                      placeholder="Alt text (describe the photo)"
                      aria-label={`Alt text for image ${i + 1}`}
                      onChange={(e) => {
                        setDirty(true);
                        setImages((prev) => prev.map((x) => (x.key === img.key ? { ...x, alt: e.target.value } : x)));
                      }}
                    />
                    {colors.length > 0 && (
                      <Select
                        className="h-9 rounded-xl px-3 text-[0.8rem]"
                        value={img.colorKey ?? ""}
                        aria-label={`Colour for image ${i + 1}`}
                        onChange={(e) => {
                          setDirty(true);
                          setImages((prev) => prev.map((x) => (x.key === img.key ? { ...x, colorKey: e.target.value || null } : x)));
                        }}
                      >
                        <option value="">All colours</option>
                        {colors.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="stitch-border flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl text-sm font-semibold text-cocoa-500 hover:text-cocoa"
                  >
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    Add more
                  </button>
                </li>
              </ul>
            )}
          </Card>

          {/* ---------------- Colours */}
          <Card title="Colours" description="Optional. Each colour gets its own sizes and stock below.">
            {colors.length > 0 && (
              <ul className="mb-4 flex flex-col divide-y divide-cocoa-50 rounded-xl border border-cocoa-100">
                {colors.map((c, i) => (
                  <li key={c.key} className="flex items-center gap-3 px-3 py-2.5">
                    <input
                      type="color"
                      value={c.hex}
                      aria-label={`${c.name} colour value`}
                      onChange={(e) => {
                        setDirty(true);
                        setColors((prev) => prev.map((x) => (x.key === c.key ? { ...x, hex: e.target.value } : x)));
                      }}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-cocoa-100 bg-transparent p-0.5"
                    />
                    <Input
                      className="h-10 rounded-xl"
                      value={c.name}
                      aria-label="Colour name"
                      onChange={(e) => {
                        setDirty(true);
                        setColors((prev) => prev.map((x) => (x.key === c.key ? { ...x, name: e.target.value } : x)));
                      }}
                    />
                    <span className="hidden w-20 shrink-0 font-mono text-xs text-cocoa-500 sm:block">{c.hex.toUpperCase()}</span>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" disabled={i === 0} onClick={() => moveColor(i, -1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cocoa-50 disabled:opacity-30" aria-label={`Move ${c.name} up`}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" disabled={i === colors.length - 1} onClick={() => moveColor(i, 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cocoa-50 disabled:opacity-30" aria-label={`Move ${c.name} down`}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => removeColor(c.key)} className="grid h-8 w-8 place-items-center rounded-full text-coral-700 hover:bg-coral-50" aria-label={`Remove ${c.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-end gap-3">
              <input
                type="color"
                value={newColor.hex}
                onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))}
                aria-label="New colour value"
                className="h-12 w-12 cursor-pointer rounded-full border border-cocoa-100 bg-transparent p-1"
              />
              <Field label="New colour name" htmlFor="newColor" className="min-w-[180px] flex-1">
                <Input
                  id="newColor"
                  value={newColor.name}
                  placeholder="e.g. Sage"
                  onChange={(e) => setNewColor((c) => ({ ...c, name: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                />
              </Field>
              <Button type="button" variant="secondary" onClick={addColor} disabled={!newColor.name.trim()}>
                <Plus className="h-4 w-4" /> Add colour
              </Button>
            </div>
          </Card>

          {/* ---------------- Sizes & inventory */}
          <Card title="Sizes & inventory" description={`Pick the sizes this product comes in. Total stock: ${totalStock}`}>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sizes">
              {[...SIZES, ...sizes.filter((s) => !(SIZES as readonly string[]).includes(s))].map((s) => {
                const on = sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSize(s)}
                    className={cn(
                      "h-10 rounded-full border px-4 text-sm font-semibold transition",
                      on ? "border-cocoa bg-cocoa text-cream-50" : "border-cocoa-100 bg-cream-50 text-cocoa-600 hover:border-cocoa-400",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input
                className="h-10 max-w-[200px] rounded-full"
                placeholder="Custom size (e.g. One size)"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                aria-label="Custom size"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const s = customSize.trim();
                    if (s && !sizes.includes(s)) toggleSize(s);
                    setCustomSize("");
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const s = customSize.trim();
                  if (s && !sizes.includes(s)) toggleSize(s);
                  setCustomSize("");
                }}
              >
                <Plus className="h-4 w-4" /> Add size
              </Button>
            </div>

            {sizes.length === 0 ? (
              <p className="mt-6 rounded-xl bg-cream-100 px-4 py-3 text-sm text-cocoa-500">Select at least one size to set SKUs and stock.</p>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap items-end gap-2">
                  <Field label="Set stock for every variant" htmlFor="bulkStock">
                    <Input id="bulkStock" className="h-10 w-32 rounded-xl" inputMode="numeric" value={bulkStock} onChange={(e) => setBulkStock(e.target.value.replace(/[^\d]/g, ""))} />
                  </Field>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={bulkStock === ""}
                    onClick={() => {
                      setDirty(true);
                      setCells((prev) => {
                        const next = { ...prev };
                        for (const ck of colorKeys) for (const s of sizes) next[cellKey(ck, s)] = { ...cellFor(ck, s), stock: bulkStock };
                        return next;
                      });
                    }}
                    className="mb-0.5"
                  >
                    Apply
                  </Button>
                </div>
                <div className="mt-4 -mx-5 overflow-x-auto md:mx-0">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="text-[0.72rem] font-bold tracking-wider text-cocoa-500 uppercase">
                        {colors.length > 0 && <th className="px-2 py-2">Colour</th>}
                        <th className="px-2 py-2">Size</th>
                        <th className="px-2 py-2">SKU</th>
                        <th className="w-24 px-2 py-2">Stock</th>
                        <th className="w-32 px-2 py-2">Price override</th>
                        <th className="w-16 px-2 py-2 text-center">Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colorKeys.map((ck) =>
                        sizes.map((s, si) => {
                          const c = cellFor(ck, s);
                          const color = colors.find((x) => x.key === ck);
                          return (
                            <tr key={cellKey(ck, s)} className={cn("border-t border-cocoa-50", !c.isActive && "opacity-55")}>
                              {colors.length > 0 && (
                                <td className="px-2 py-1.5">
                                  {si === 0 && color && (
                                    <span className="flex items-center gap-2 font-semibold">
                                      <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: color.hex }} />
                                      {color.name}
                                    </span>
                                  )}
                                </td>
                              )}
                              <td className="px-2 py-1.5 font-semibold whitespace-nowrap">{s}</td>
                              <td className="px-2 py-1.5">
                                <Input className="h-9 rounded-lg px-2.5 font-mono text-[0.78rem]" value={c.sku} aria-label={`SKU ${color?.name ?? ""} ${s}`} onChange={(e) => patchCell(ck, s, { sku: e.target.value.toUpperCase().replace(/\s/g, "-") })} />
                              </td>
                              <td className="px-2 py-1.5">
                                <Input
                                  className={cn("h-9 rounded-lg px-2.5 tabular-nums", Number(c.stock) <= 0 && "text-coral-700", Number(c.stock) > 0 && Number(c.stock) <= 3 && "text-sun-700")}
                                  inputMode="numeric"
                                  value={c.stock}
                                  aria-label={`Stock ${color?.name ?? ""} ${s}`}
                                  onChange={(e) => patchCell(ck, s, { stock: e.target.value.replace(/[^\d]/g, "") })}
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <Input className="h-9 rounded-lg px-2.5 tabular-nums" inputMode="numeric" placeholder="—" value={c.price} aria-label={`Price override ${color?.name ?? ""} ${s}`} onChange={(e) => patchCell(ck, s, { price: e.target.value.replace(/[^\d]/g, "") })} />
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <input type="checkbox" className="kt-checkbox h-5 w-5 cursor-pointer appearance-none rounded-md border border-cocoa-200 bg-cream-50 checked:border-sage-600 checked:bg-sage-600" checked={c.isActive} aria-label={`Active ${color?.name ?? ""} ${s}`} onChange={(e) => patchCell(ck, s, { isActive: e.target.checked })} />
                              </td>
                            </tr>
                          );
                        }),
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {variantErrors.length > 0 && (
              <ul className="mt-4 space-y-1 rounded-xl bg-coral-50 px-4 py-3 text-sm text-coral-800">
                {variantErrors.slice(0, 5).map(([k, v]) => (
                  <li key={k}>{v?.[0]}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ---------------- Sidebar */}
        <div className="flex flex-col gap-6">
          <Card title="Status">
            <div className="flex flex-col gap-4">
              <Select value={f.status} onChange={(e) => set("status", e.target.value as ProductFormData["status"])} aria-label="Status">
                <option value="DRAFT">Draft — hidden from the store</option>
                <option value="ACTIVE">Active — visible in the store</option>
                <option value="ARCHIVED">Archived — hidden, kept for records</option>
              </Select>
              <Checkbox label="Sample product (shows a “Sample” label)" checked={f.isSample} onChange={(e) => set("isSample", e.target.checked)} />
              {product && f.status === "ACTIVE" && (
                <Link href={`/products/${product.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage-700 hover:underline">
                  View on store <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </Card>

          <Card title="Organisation">
            <div className="flex flex-col gap-5">
              <Field label="Gender" htmlFor="gender">
                <Select id="gender" value={f.gender} onChange={(e) => set("gender", e.target.value as ProductFormData["gender"])}>
                  <option value="UNISEX">Unisex</option>
                  <option value="BOY">Boys</option>
                  <option value="GIRL">Girls</option>
                </Select>
              </Field>
              <fieldset>
                <legend className="mb-2 text-[0.82rem] font-semibold text-cocoa-600">Categories & collections</legend>
                {categories.length === 0 ? (
                  <p className="text-sm text-cocoa-500">
                    No categories yet. <Link href="/admin/categories/new" className="font-semibold text-sage-700 underline">Create one</Link>
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {categories.map((c) => (
                      <Checkbox
                        key={c.id}
                        label={
                          <>
                            {c.name} {c.kind === "collection" && <span className="text-xs text-cocoa-400">(collection)</span>}
                          </>
                        }
                        checked={f.categoryIds.includes(c.id)}
                        onChange={(e) => set("categoryIds", e.target.checked ? [...f.categoryIds, c.id] : f.categoryIds.filter((x) => x !== c.id))}
                      />
                    ))}
                  </div>
                )}
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-[0.82rem] font-semibold text-cocoa-600">Merchandising</legend>
                <div className="flex flex-col gap-2.5">
                  <Checkbox label="Featured" checked={f.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
                  <Checkbox label="New arrival" checked={f.isNewArrival} onChange={(e) => set("isNewArrival", e.target.checked)} />
                  <Checkbox label="Best seller" checked={f.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} />
                </div>
              </fieldset>
              <Field label="Size guide" htmlFor="sizeGuide" hint={<Link href="/admin/size-guides" className="underline">Manage size guides</Link>}>
                <Select id="sizeGuide" value={f.sizeGuideId} onChange={(e) => set("sizeGuideId", e.target.value)}>
                  <option value="">Store default</option>
                  {sizeGuides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                      {g.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card title="Search engine listing" description="Leave blank to use the product name and description.">
            <div className="flex flex-col gap-4">
              <Field label="SEO title" htmlFor="seoTitle" optional hint={`${f.seoTitle.length}/70`}>
                <Input id="seoTitle" value={f.seoTitle} maxLength={160} onChange={(e) => set("seoTitle", e.target.value)} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription" optional hint={`${f.seoDescription.length}/160`}>
                <Textarea id="seoDescription" rows={3} value={f.seoDescription} maxLength={320} onChange={(e) => set("seoDescription", e.target.value)} />
              </Field>
            </div>
          </Card>
        </div>
      </div>

      {/* ---------------- Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cocoa-100 bg-cream/95 backdrop-blur lg:left-[260px]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 md:px-8">
          <p className={cn("min-w-0 flex-1 truncate text-sm", formError ? "font-semibold text-coral-700" : "text-cocoa-500")} role={formError ? "alert" : undefined}>
            {formError || (dirty ? "You have unsaved changes." : product ? "All changes saved." : "Fill in the details and save.")}
          </p>
          <Link href="/admin/products" className="hidden text-sm font-semibold text-cocoa-500 hover:text-cocoa sm:block">
            Cancel
          </Link>
          <Button type="submit" loading={pending} disabled={uploading} title={uploading ? "Wait for images to finish uploading" : undefined}>
            {uploading ? "Uploading images…" : product ? "Save product" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
