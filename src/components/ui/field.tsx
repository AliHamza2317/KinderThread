import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { control } from "./control";

export { Select } from "./select";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  optional,
}: {
  label: ReactNode;
  htmlFor?: string;
  error?: string | string[];
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  const msg = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[0.82rem] font-medium text-cocoa-600">
        {label}
        {optional && <span className="ml-1 font-normal tracking-normal text-cocoa-400 normal-case">(optional)</span>}
      </label>
      {children}
      {msg ? (
        <p className="text-[0.8rem] font-medium text-coral-700" role="alert">
          {msg}
        </p>
      ) : hint ? (
        <p className="text-[0.8rem] text-cocoa-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-3 text-[0.92rem] text-cocoa-600", className)}>
      <input
        type="checkbox"
        className="kt-checkbox h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border border-cocoa-200 bg-cream-50 transition checked:border-cocoa checked:bg-cocoa"
        {...props}
      />
      {label}
    </label>
  );
}
