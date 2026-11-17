import { Feather, Gift, Heart, MessageCircle, Ruler, ShoppingBag, Sparkles, Truck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const ICONS: Record<string, LucideIcon> = { sparkles: Sparkles, feather: Feather, bag: ShoppingBag, chat: MessageCircle, truck: Truck, heart: Heart, ruler: Ruler, gift: Gift };
const DOTS = ["bg-sage-100 text-sage-700", "bg-coral-100 text-coral-700", "bg-sun-100 text-sun-700", "bg-teal-100 text-teal-600", "bg-bear-100 text-cocoa-600"];

export function Benefits({ items }: { items: { title: string; body: string; icon: string }[] }) {
  return (
    <Reveal as="ul" stagger={0.08} className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((b, i) => {
        const Icon = ICONS[b.icon] ?? Sparkles;
        return (
          <li key={b.title} className="flex flex-col">
            <span className={`grid h-14 w-14 place-items-center rounded-full ${DOTS[i % DOTS.length]}`}>
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <h3 className="mt-5 font-display text-[1.35rem] leading-tight">{b.title}</h3>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-cocoa-500">{b.body}</p>
          </li>
        );
      })}
    </Reveal>
  );
}
