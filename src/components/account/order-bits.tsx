import { Check, PackageX, RotateCcw } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/orders";
import { cn, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const TONE: Record<OrderStatus, BadgeTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  RETURNED: "neutral",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}

/** Five-step progress tracker; cancelled / returned orders get their own state. */
export function OrderProgress({ status, events }: { status: OrderStatus; events: { status: OrderStatus | null; createdAt: Date }[] }) {
  if (status === "CANCELLED" || status === "RETURNED") {
    const Icon = status === "CANCELLED" ? PackageX : RotateCcw;
    return (
      <div className={cn("flex items-start gap-4 rounded-md p-5", status === "CANCELLED" ? "bg-coral-50" : "bg-cocoa-50")}>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", status === "CANCELLED" ? "bg-coral-100 text-coral-700" : "bg-cocoa-100 text-cocoa-600")}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">{status === "CANCELLED" ? "This order was cancelled" : "This order was returned"}</p>
          <p className="mt-0.5 text-sm text-cocoa-500">
            {status === "CANCELLED"
              ? "If you paid in advance, any refund is processed to your original payment method or by bank transfer."
              : "Your return has been completed. Thank you for shopping with us."}
          </p>
        </div>
      </div>
    );
  }
  const current = ORDER_FLOW.indexOf(status);
  const when = (s: OrderStatus) => events.filter((e) => e.status === s).at(-1)?.createdAt;
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {ORDER_FLOW.map((s, i) => {
        const done = i <= current;
        const at = when(s);
        return (
          <li key={s} className="relative flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
            {i > 0 && (
              <span className={cn("absolute top-[15px] right-1/2 h-[2px] w-full -translate-x-[16px]", i <= current ? "bg-sage-500" : "bg-cocoa-100")} aria-hidden />
            )}
            <span
              className={cn(
                "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 transition",
                done ? "border-sage-500 bg-sage-500 text-cream-50" : "border-cocoa-100 bg-cream text-cocoa-300",
                i === current && "ring-4 ring-sage-100",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={cn("mt-2 text-[0.7rem] leading-tight font-semibold sm:text-[0.78rem]", done ? "text-cocoa" : "text-cocoa-400")}>{ORDER_STATUS_LABEL[s]}</span>
            {at && done && <span className="mt-0.5 hidden text-[0.7rem] text-cocoa-400 sm:block">{formatDate(at, { day: "numeric", month: "short" })}</span>}
          </li>
        );
      })}
    </ol>
  );
}
