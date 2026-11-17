import { Feather, Gift, Heart, MessageCircle, Ruler, ShoppingBag, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const ICONS: Record<string, LucideIcon> = { sparkles: Sparkles, feather: Feather, bag: ShoppingBag, chat: MessageCircle, truck: Truck, heart: Heart, ruler: Ruler, gift: Gift };

export function Benefits({ items }: { items: { title: string; body: string; icon: string }[] }) {
  return (
    <Reveal as="ul" stagger={0.08} className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((b) => {
        const Icon = ICONS[b.icon] ?? Sparkles;
        return (
          <li key={b.title} className="flex flex-col border-t border-cocoa-200/70 pt-6">
            <Icon className="h-6 w-6 text-cocoa-600" strokeWidth={1.3} />
            <h3 className="mt-5 font-display text-[1.3rem] leading-tight">{b.title}</h3>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-cocoa-500">{b.body}</p>
          </li>
        );
      })}
    </Reveal>
  );
}
