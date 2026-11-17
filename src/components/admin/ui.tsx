import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/enums";
import { Badge, type BadgeTone } from "@/components/ui/badge";

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm font-semibold text-cocoa-500 hover:text-cocoa">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-cocoa-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className, actions }: { title?: ReactNode; description?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-cocoa-100 bg-white/70 p-5 md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-sans text-base font-bold tracking-normal">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.82rem] text-cocoa-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "neutral", href }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "neutral" | "sage" | "coral" | "sun"; href?: string }) {
  const dot = { neutral: "bg-cocoa-300", sage: "bg-sage-500", coral: "bg-coral-500", sun: "bg-sun" }[tone];
  const body = (
    <div className="h-full rounded-2xl border border-cocoa-100 bg-white/70 p-5 transition hover:border-cocoa-200">
      <p className="flex items-center gap-2 text-[0.78rem] font-semibold tracking-wide text-cocoa-500 uppercase">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        {label}
      </p>
      <p className="mt-3 font-display text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[0.8rem] text-cocoa-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** Styled table primitives — wrap in <TableWrap> for horizontal scroll on mobile. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-5 overflow-x-auto md:mx-0">{children}</div>;
}
export const tableCls = "w-full min-w-[640px] text-left text-sm";
export const thCls = "border-b border-cocoa-100 px-3 py-2.5 text-[0.72rem] font-bold tracking-wider text-cocoa-500 uppercase";
export const tdCls = "border-b border-cocoa-50 px-3 py-3 align-middle";

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="stitch-border flex flex-col items-center rounded-2xl px-6 py-14 text-center">
      <p className="font-display text-xl">{title}</p>
      {body && <p className="mt-2 max-w-md text-sm text-cocoa-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const ORDER_TONE: Record<OrderStatus, BadgeTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  RETURNED: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONE[status]}>{status.toLowerCase()}</Badge>;
}

export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
