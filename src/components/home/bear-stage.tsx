"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { detectDeviceTier, type DeviceTier } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const BearScene = dynamic(() => import("@/components/three/bear-scene"), { ssr: false });

/**
 * The Peek-a-boo Bear stage: a static poster (fast LCP, low-power fallback)
 * that cross-fades into the live 3D scene on capable devices.
 */
export function BearStage({ className, hint = true }: { className?: string; hint?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // decide on 3D once the browser is idle so text paints first
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const go = () => setTier(detectDeviceTier());
    if (ric) ric(go, { timeout: 900 });
    else setTimeout(go, 200);
  }, []);

  useEffect(() => {
    if (!stage.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  const showCanvas = tier === "full" || tier === "lite";
  return (
    <div ref={stage} className={cn("relative aspect-[1.1/1]", className)}>
      <div data-hero-disc className="absolute inset-[8%] rounded-full bg-bear-100" aria-hidden />
      <Image
        src="/brand/hero-bear.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 45vw, 90vw"
        className={cn("object-contain transition-opacity duration-700", showCanvas && ready ? "opacity-0" : "opacity-100")}
      />
      {showCanvas && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
          <BearScene tier={tier} active={visible} onReady={() => setReady(true)} />
        </div>
      )}
      {hint && showCanvas && ready && (
        <p className="pointer-events-none absolute -bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-[0.72rem] font-semibold text-cocoa-400 md:flex" aria-hidden>
          <MousePointerClick className="h-3.5 w-3.5" /> Click the bear to say hello
        </p>
      )}
    </div>
  );
}
