"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import logo from "../../../public/brand/logo-mark-alpha.png";

/**
 * Branded intro on the first storefront visit of a session. The <html> gets the
 * `kt-intro` class from an inline script before paint, so the curtain is there
 * from the first frame; it then counts up and lifts away.
 */
export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("kt-intro") || !root.current) {
      setMounted(false);
      return;
    }
    try {
      sessionStorage.setItem("kt-intro", "1");
    } catch {}
    const counter = { v: 0 };
    const finish = () => {
      html.classList.remove("kt-intro");
      setMounted(false);
      window.dispatchEvent(new Event("kt:intro-done"));
    };
    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo("[data-pre-logo]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" })
      .to(counter, { v: 100, duration: 1.2, ease: "power2.inOut", onUpdate: () => count.current && (count.current.textContent = String(Math.round(counter.v)).padStart(3, "0")) }, 0)
      .to("[data-pre-inner]", { opacity: 0, y: -20, duration: 0.45, ease: "power2.in" }, ">-0.05")
      .to(root.current, { yPercent: -100, duration: 0.95, ease: "expo.inOut" }, ">-0.1");
    return () => {
      tl.kill();
      html.classList.remove("kt-intro");
    };
  }, []);

  if (!mounted) return null;
  return (
    <div ref={root} className="kt-preloader fixed inset-0 z-[150] items-center justify-center rounded-b-[2.5rem] bg-cream" aria-hidden>
      <div data-pre-inner className="flex flex-col items-center gap-6">
        <div data-pre-logo className="w-40 md:w-48">
          <Image src={logo} alt="" priority className="h-auto w-full" />
        </div>
        <span ref={count} className="font-display text-sm tabular-nums tracking-[0.3em] text-cocoa-500">
          000
        </span>
      </div>
    </div>
  );
}
