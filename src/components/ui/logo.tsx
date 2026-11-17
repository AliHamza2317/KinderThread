import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import mark from "../../../public/brand/logo-mark-alpha.png";
import full from "../../../public/brand/logo-full.png";

/** The supplied Kinder Thread logo (transparent version — colours and proportions unchanged). */
export function Logo({ variant = "mark", className, priority, href = "/" }: { variant?: "mark" | "full"; className?: string; priority?: boolean; href?: string | null }) {
  const img = (
    <Image
      src={variant === "full" ? full : mark}
      alt="Kinder Thread — Kids Clothing Brand"
      priority={priority}
      sizes={variant === "full" ? "280px" : "160px"}
      className={cn("h-auto w-full", className)}
    />
  );
  if (href === null) return img;
  return (
    <Link href={href} aria-label="Kinder Thread home" className="block">
      {img}
    </Link>
  );
}
