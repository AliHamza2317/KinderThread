"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type Msg = { text: string; href?: string };

export function AnnouncementBar({ messages }: { messages: Msg[] }) {
  const pathname = usePathname();
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("kt-ann-hidden") === "1") setHidden(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length < 2 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 4800);
    return () => clearInterval(t);
  }, [messages.length, paused]);

  if (hidden || !messages.length || pathname === "/checkout") return null;
  const m = messages[i % messages.length];

  return (
    <div
      className="relative z-50 bg-cocoa-800 text-cream-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Announcements"
    >
      <div className="container-kt flex h-9 items-center justify-center pr-10 pl-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 items-center gap-2 truncate text-[0.64rem] font-semibold tracking-[0.12em] uppercase sm:text-[0.7rem] sm:tracking-[0.18em]"
            aria-live="polite"
          >
            {m.href ? (
              <Link href={m.href} className="link-underline truncate">
                {m.text}
              </Link>
            ) : (
              <span className="truncate">{m.text}</span>
            )}
          </motion.p>
        </AnimatePresence>
        <button
          className="absolute right-2 grid h-8 w-8 place-items-center rounded-full text-cream-200/70 hover:text-cream-50 md:right-6"
          onClick={() => {
            setHidden(true);
            try {
              sessionStorage.setItem("kt-ann-hidden", "1");
            } catch {}
          }}
          aria-label="Dismiss announcements"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
