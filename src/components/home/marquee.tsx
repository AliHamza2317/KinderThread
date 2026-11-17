export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const row = [...items, ...items, ...items];
  return (
    <div className="group relative overflow-hidden border-y border-cocoa-100 bg-cream py-5" aria-label={items.join(" · ")}>
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused] motion-reduce:animate-none" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center gap-10">
            {row.map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-10 font-display text-[1.35rem] whitespace-nowrap text-cocoa-600 italic md:text-[1.6rem]">
                {t}
                <span className="text-[1rem] not-italic text-sun" aria-hidden>
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
