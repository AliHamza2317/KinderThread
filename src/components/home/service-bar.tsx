import { Banknote, RotateCcw, Ruler, Truck, type LucideIcon } from "lucide-react";

export type ServiceItem = { icon: "truck" | "cash" | "exchange" | "ruler"; label: string };
const ICONS: Record<ServiceItem["icon"], LucideIcon> = { truck: Truck, cash: Banknote, exchange: RotateCcw, ruler: Ruler };

/** Slim strip of practical promises under the hero — only shows what the store is configured to offer. */
export function ServiceBar({ items }: { items: ServiceItem[] }) {
  if (!items.length) return null;
  return (
    <div className="border-b border-cocoa-100 bg-cream-100">
      <ul className="container-kt grid grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon, label }, i) => {
          const Icon = ICONS[icon];
          return (
            <li key={label} className={`flex items-center justify-center gap-3 px-2 py-5 text-center text-[0.72rem] font-bold tracking-[0.12em] text-cocoa-600 uppercase sm:text-[0.74rem] ${i > 0 ? "lg:border-l lg:border-cocoa-100" : ""} ${i % 2 === 1 ? "max-lg:border-l max-lg:border-cocoa-100" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-cocoa-100" : ""}`}>
              <Icon className="h-4 w-4 shrink-0 text-cocoa-500" strokeWidth={1.6} />
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
