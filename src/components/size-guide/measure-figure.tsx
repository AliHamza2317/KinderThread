import { cn } from "@/lib/utils";

/** How to take each measurement. Numbers match the drawing. */
export const HOW_TO_MEASURE = [
  { n: 1, key: "height", title: "Height", body: "Stand them against a wall without shoes, heels together. Measure from the floor to the top of the head. For babies, measure lying flat." },
  { n: 2, key: "chest", title: "Chest", body: "Measure around the fullest part of the chest, just under the arms. Keep the tape snug but not tight." },
  { n: 3, key: "waist", title: "Waist", body: "Measure around the natural waistline, just above the belly button, over a thin vest or nappy." },
  { n: 4, key: "length", title: "Length", body: "Back length of the top: from the base of the neck down to the hem." },
] as const;

function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="10.5" className="fill-cocoa" />
      <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" className="fill-cream-50 text-[11px] font-semibold">
        {n}
      </text>
    </g>
  );
}

/**
 * A simple line drawing of a little one in a tee and shorts with the four measurements
 * marked — no face and no photo, so it reads the same for every child.
 */
export function MeasureFigure({ className, active }: { className?: string; active?: string | null }) {
  const dim = (k: string) => cn("transition-opacity duration-300", active && active !== k && "opacity-25");
  return (
    <svg viewBox="0 0 300 380" role="img" aria-label="Where to measure: 1 height, 2 chest, 3 waist, 4 length" className={cn("h-auto w-full", className)}>
      {/* floor */}
      <path d="M40 352 H262" className="stroke-cocoa/15" strokeWidth="1.5" strokeLinecap="round" />

      {/* figure */}
      <g className="stroke-cocoa-600" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
        {/* legs + feet */}
        <path d="M122 282 L122 336 Q122 344 114 345 L110 346 Q104 352 112 352 L140 352 Q145 352 145 346 L144 282 Z" className="fill-[#f3e2d0]" />
        <path d="M178 282 L178 336 Q178 344 186 345 L190 346 Q196 352 188 352 L160 352 Q155 352 155 346 L156 282 Z" className="fill-[#f3e2d0]" />
        {/* arms */}
        <path d="M93 158 L104 166 L108 210 Q109 220 100 220 Q92 220 92 211 Z" className="fill-[#f3e2d0]" />
        <path d="M207 158 L196 166 L192 210 Q191 220 200 220 Q208 220 208 211 Z" className="fill-[#f3e2d0]" />
        {/* shorts */}
        <path d="M115 232 L185 232 L190 286 L156 286 L150 262 L144 286 L110 286 Z" className="fill-sage-200" />
        {/* tee */}
        <path d="M133 112 Q150 124 167 112 L189 120 L214 150 L198 166 L185 152 L186 234 L114 234 L115 152 L102 166 L86 150 L111 120 Z" className="fill-cream-50" />
        <path d="M133 112 Q150 124 167 112" className="fill-none" />
        {/* neck + head */}
        <path d="M142 104 L142 114 Q150 120 158 114 L158 104" className="fill-[#f3e2d0]" />
        <circle cx="117" cy="74" r="6.5" className="fill-[#f3e2d0]" />
        <circle cx="183" cy="74" r="6.5" className="fill-[#f3e2d0]" />
        <circle cx="150" cy="72" r="33" className="fill-[#f3e2d0]" />
        <path d="M141 40 Q146 30 156 34 Q151 36 152 41" className="fill-none" />
      </g>

      {/* 1 · height */}
      <g className={dim("height")}>
        <path d="M150 39 H52 M112 352 H52" className="stroke-sage-600" strokeWidth="1.2" strokeDasharray="3 4" />
        <path d="M52 41 V350 M46 39 H58 M46 352 H58" className="stroke-sage-700" strokeWidth="1.6" strokeLinecap="round" />
        <Badge x={52} y={196} n={1} />
      </g>

      {/* 2 · chest */}
      <g className={dim("chest")}>
        <path d="M116 170 Q150 182 184 170" className="fill-none stroke-sage-700" strokeWidth="1.8" strokeDasharray="4 3.5" strokeLinecap="round" />
        <Badge x={150} y={190} n={2} />
      </g>

      {/* 3 · waist */}
      <g className={dim("waist")}>
        <path d="M114 244 Q150 256 186 244" className="fill-none stroke-sage-700" strokeWidth="1.8" strokeDasharray="4 3.5" strokeLinecap="round" />
        <Badge x={150} y={266} n={3} />
      </g>

      {/* 4 · length */}
      <g className={dim("length")}>
        <path d="M167 112 H246 M186 234 H246" className="stroke-sage-600" strokeWidth="1.2" strokeDasharray="3 4" />
        <path d="M246 114 V232 M240 112 H252 M240 234 H252" className="stroke-sage-700" strokeWidth="1.6" strokeLinecap="round" />
        <Badge x={246} y={173} n={4} />
      </g>
    </svg>
  );
}
