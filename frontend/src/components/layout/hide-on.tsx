"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders its children except on the given paths (e.g. no footer on the sign-in pages). */
export function HideOn({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname();
  if (paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}
