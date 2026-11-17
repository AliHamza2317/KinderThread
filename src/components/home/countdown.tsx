"use client";

import { useEffect, useState } from "react";

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!Number.isFinite(target) || now === null) return null;
  const diff = Math.max(0, target - now);
  if (diff === 0) return null;
  const parts = [
    ["days", Math.floor(diff / 864e5)],
    ["hours", Math.floor(diff / 36e5) % 24],
    ["minutes", Math.floor(diff / 6e4) % 60],
    ["seconds", Math.floor(diff / 1e3) % 60],
  ] as const;
  return (
    <dl className="mt-8 flex gap-3" aria-label="Time until launch">
      {parts.map(([k, v]) => (
        <div key={k} className="min-w-[4.5rem] rounded-2xl bg-cream-100 px-3 py-3 text-center">
          <dd className="font-display text-3xl tabular-nums">{String(v).padStart(2, "0")}</dd>
          <dt className="text-[0.68rem] font-bold tracking-[0.16em] text-cocoa-500 uppercase">{k}</dt>
        </div>
      ))}
    </dl>
  );
}
