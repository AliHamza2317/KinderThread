"use client";

import { useActionState, useState, type ReactNode } from "react";
import { saveSettingsAction } from "@/actions/admin/content";
import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { ImageInput } from "@/components/admin/image-input";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { getPath, nest, setPathImmutable } from "./path";

export type FieldSpec =
  | {
      path: string;
      label: string;
      type?: "text" | "textarea" | "number" | "date" | "email" | "url" | "tel";
      hint?: ReactNode;
      placeholder?: string;
      disabled?: boolean;
      wide?: boolean;
      rows?: number;
      min?: number;
      max?: number;
    }
  | { path: string; label: string; type: "checkbox"; hint?: ReactNode; disabled?: boolean; wide?: boolean }
  | { path: string; label: string; type: "select"; options: { value: string; label: string }[]; hint?: ReactNode; disabled?: boolean; wide?: boolean }
  | { type: "heading"; label: string; hint?: ReactNode; path?: never }
  | { type: "note"; label: ReactNode; tone?: "info" | "warning"; path?: never };

export type ImageSpec = { path: string; label: string; folder?: string; aspect?: string };

/**
 * Generic editor for a settings key (or a sub-object of it via `root`).
 * Sends a JSON patch to saveSettingsAction, which merges and validates server-side.
 */
export function SettingsForm({
  settingKey,
  root = "",
  initial,
  fields,
  images = [],
  readOnly,
  submitLabel = "Save changes",
  footer,
}: {
  settingKey: string;
  root?: string;
  initial: Record<string, unknown>;
  fields: FieldSpec[];
  images?: ImageSpec[];
  readOnly?: boolean;
  submitLabel?: string;
  footer?: ReactNode;
}) {
  const [state, action] = useActionState(saveSettingsAction, null);
  const [value, setValue] = useState<Record<string, unknown>>(initial);
  const prefix = root ? `${root}.` : "";
  const errorFor = (p: string) => (state && !state.ok ? state.errors?.[prefix + p] : undefined);

  const set = (path: string, v: unknown) => setValue((cur) => setPathImmutable(cur, path, v));
  // Image values travel as separate `img:` fields so they are excluded from the JSON patch.
  const imagePaths = new Set(images.map((i) => i.path));
  const patchValue = Object.fromEntries(Object.entries(value).filter(([k]) => !imagePaths.has(k)));

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="key" value={settingKey} />
      <input type="hidden" name="payload" value={JSON.stringify(root ? nest(root, patchValue) : patchValue)} />
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 rounded-lg border border-[var(--adm-line,#e6e1d9)] bg-[#fbfaf8] p-4 sm:col-span-2">
            {images.map((img) => (
              <ImageInput
                key={img.path}
                name={`img:${prefix}${img.path}`}
                label={img.label}
                folder={img.folder ?? "marketing"}
                aspect={img.aspect}
                defaultValue={String(getPath(initial, img.path) ?? "")}
                className="w-[180px]"
              />
            ))}
          </div>
        )}
        {fields.map((f, i) => {
          if (f.type === "heading")
            return (
              <div key={`h${i}`} className="mt-3 border-t border-cocoa-100 pt-5 sm:col-span-2 first:mt-0 first:border-0 first:pt-0">
                <h3 className="font-sans text-[0.95rem] font-bold tracking-normal">{f.label}</h3>
                {f.hint && <p className="mt-0.5 text-[0.82rem] text-cocoa-500">{f.hint}</p>}
              </div>
            );
          if (f.type === "note")
            return (
              <p
                key={`n${i}`}
                className={cn(
                  "rounded-xl px-4 py-3 text-[0.85rem] sm:col-span-2",
                  f.tone === "warning" ? "bg-sun-50 text-sun-700 ring-1 ring-sun-200" : "bg-sage-50 text-sage-800 ring-1 ring-sage-100",
                )}
              >
                {f.label}
              </p>
            );
          const id = `${settingKey}-${prefix}${f.path}`.replace(/\./g, "-");
          const current = getPath(value, f.path);
          if (f.type === "checkbox")
            return (
              <div key={f.path} className={cn("flex flex-col gap-1", f.wide && "sm:col-span-2")}>
                <Checkbox
                  id={id}
                  label={<span className="font-semibold text-cocoa">{f.label}</span>}
                  checked={!!current}
                  disabled={f.disabled}
                  onChange={(e) => set(f.path, e.target.checked)}
                />
                {f.hint && <p className="pl-8 text-[0.8rem] text-cocoa-500">{f.hint}</p>}
              </div>
            );
          const common = {
            id,
            disabled: f.disabled,
            placeholder: "placeholder" in f ? f.placeholder : undefined,
            "aria-invalid": errorFor(f.path) ? true : undefined,
          };
          return (
            <Field key={f.path} label={f.label} htmlFor={id} hint={f.hint} error={errorFor(f.path)} className={cn((f.wide || f.type === "textarea") && "sm:col-span-2")}>
              {f.type === "select" ? (
                <Select {...common} value={String(current ?? "")} onChange={(e) => set(f.path, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea {...common} rows={f.rows ?? 3} value={String(current ?? "")} onChange={(e) => set(f.path, e.target.value)} />
              ) : f.type === "number" ? (
                <Input
                  {...common}
                  type="number"
                  inputMode="numeric"
                  min={f.min ?? 0}
                  max={f.max}
                  step={1}
                  value={current === undefined || current === null ? "" : String(current)}
                  onChange={(e) => set(f.path, e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)))}
                />
              ) : (
                <Input {...common} type={f.type ?? "text"} value={String(current ?? "")} onChange={(e) => set(f.path, e.target.value)} />
              )}
            </Field>
          );
        })}
      </fieldset>
      {footer}
      <FormMessage state={state} />
      {!readOnly && (
        <div>
          <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
        </div>
      )}
    </form>
  );
}
