import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-md border border-cocoa-100 bg-cream-50 px-4 text-[0.95rem] text-cocoa placeholder:text-cocoa-400/80 transition-[border-color,box-shadow] duration-200 hover:border-cocoa-200 focus:border-cocoa-600 focus:outline-none focus:ring-2 focus:ring-cocoa-100 disabled:opacity-60 aria-[invalid=true]:border-coral-600";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "h-12 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237a5741' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
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
      <label htmlFor={htmlFor} className="text-[0.72rem] font-bold tracking-[0.08em] text-cocoa-600 uppercase">
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
        className="kt-checkbox h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[3px] border border-cocoa-200 bg-cream-50 transition checked:border-sage-600 checked:bg-sage-600"
        {...props}
      />
      {label}
    </label>
  );
}
