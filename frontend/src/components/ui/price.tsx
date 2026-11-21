import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  className,
  size = "md",
}: {
  price: number;
  compareAt?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const off = discountPercent(price, compareAt);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold text-cocoa", size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-[0.95rem]", off && "text-coral-700")}>
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-cocoa-400 line-through", size === "lg" ? "text-base" : "text-[0.82rem]")}>
            <span className="sr-only">Original price </span>
            {formatPrice(compareAt!)}
          </span>
          <span className="text-[0.75rem] font-bold text-coral-700">−{off}%</span>
        </>
      )}
    </span>
  );
}
