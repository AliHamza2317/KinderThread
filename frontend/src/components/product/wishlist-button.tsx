"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks";
import { toast } from "@/stores/toast";
import { useWishlist } from "@/stores/wishlist";

export function WishlistButton({ productId, name, className, variant = "floating" }: { productId: string; name: string; className?: string; variant?: "floating" | "inline" }) {
  const hydrated = useHydrated();
  const on = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const active = hydrated && on;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggle(productId);
        toast({ title: now ? "Saved to wishlist" : "Removed from wishlist", description: name, action: now ? { label: "View", href: "/wishlist" } : undefined });
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        variant === "floating"
          ? "grid h-10 w-10 place-items-center rounded-full bg-cream-50/90 text-cocoa shadow-soft backdrop-blur transition hover:scale-105 hover:bg-white"
          : "grid h-14 w-14 place-items-center rounded-full border border-cocoa-100 text-cocoa transition hover:border-cocoa",
        className,
      )}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
        <Heart className={cn("h-[1.1rem] w-[1.1rem] transition-colors", active && "fill-coral text-coral-600")} />
      </motion.span>
    </button>
  );
}
