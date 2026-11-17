import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "coral" | "light" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-bold uppercase tracking-[0.14em] transition-[background-color,color,box-shadow,border-color] duration-300 ease-[var(--ease-soft)] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-cocoa-800 text-cream-50 hover:bg-sage-700",
  secondary: "border border-cocoa-800 bg-transparent text-cocoa-800 hover:bg-cocoa-800 hover:text-cream-50",
  ghost: "bg-transparent text-cocoa hover:bg-cocoa-50",
  coral: "bg-cream-50 text-cocoa-800 hover:bg-white",
  light: "bg-cream-50 text-cocoa-800 hover:bg-white",
  danger: "bg-coral-700 text-white hover:bg-coral-800",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.66rem]",
  md: "h-12 px-7 text-[0.72rem]",
  lg: "h-14 px-9 text-[0.76rem]",
  icon: "h-11 w-11",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean };

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode };

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: LinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
