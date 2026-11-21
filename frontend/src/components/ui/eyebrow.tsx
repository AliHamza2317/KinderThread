import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, rule = true, className }: { children: ReactNode; rule?: boolean; className?: string }) {
  return <p className={cn("eyebrow", rule && "eyebrow-rule", className)}>{children}</p>;
}
