/**
 * Generates clearly-labelled SAMPLE imagery (illustrated flat-lays) used while
 * real Kinder Thread photography is not yet available.
 *
 *   npm run samples
 *
 * Output: public/samples/**  (WebP). Every image carries a visible "SAMPLE" tag.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { GARMENT_OUTLINE, GARMENT_SIZE, type GarmentKind } from "../src/lib/garment-paths";
import { C, SAMPLE_PRODUCTS, productImagePath, type SampleProduct } from "../prisma/sample-data";

const OUT = path.join(process.cwd(), "public");
let uid = 0;
const nextId = (p: string) => `${p}${++uid}`;

/* ----------------------------- colour helpers ----------------------------- */
const hex2rgb = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgb2hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};
const darken = (h: string, t: number) => mix(h, "#3b2618", t);
const lighten = (h: string, t: number) => mix(h, "#ffffff", t);
const lum = (h: string) => {
  const [r, g, b] = hex2rgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const BG = {
  cream: "#F6EEDD",
  creamLight: "#FBF6EC",
  sage: "#E7ECDF",
  sageLight: "#F0F3EA",
  coral: "#FBE3D8",
  sun: "#FCEFD0",
  bear: "#F5E4D2",
  mist: "#E3EBE3",
};

function bgFor(hex: string) {
  const map: Record<string, string> = {
    [C.sage.hex]: BG.cream,
    [C.olive.hex]: BG.cream,
    [C.mist.hex]: BG.bear,
    [C.oat.hex]: BG.sage,
    [C.coral.hex]: BG.creamLight,
    [C.rose.hex]: BG.sageLight,
    [C.butter.hex]: BG.sage,
    [C.cocoa.hex]: BG.bear,
    [C.honey.hex]: BG.mist,
  };
  return map[hex] ?? BG.cream;
}

/* ------------------------------- primitives ------------------------------- */
const stitch = (d: string, color: string, w = 2.4) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="7 6" stroke-linecap="round" opacity=".7"/>`;

function button(x: number, y: number, r: number, color: string) {
  const d = darken(color, 0.25);
  const h = r * 0.28;
  return `<g>
    <circle cx="${x}" cy="${y + r * 0.18}" r="${r}" fill="#3b2618" opacity=".14"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.78}" fill="none" stroke="${d}" stroke-width="${Math.max(1, r * 0.08)}" opacity=".5"/>
    <circle cx="${x - h}" cy="${y - h}" r="${r * 0.12}" fill="${d}"/><circle cx="${x + h}" cy="${y - h}" r="${r * 0.12}" fill="${d}"/>
    <circle cx="${x - h}" cy="${y + h}" r="${r * 0.12}" fill="${d}"/><circle cx="${x + h}" cy="${y + h}" r="${r * 0.12}" fill="${d}"/>
  </g>`;
}

const snap = (x: number, y: number, c: string) =>
  `<circle cx="${x}" cy="${y}" r="6.5" fill="${lighten(c, 0.5)}" stroke="${darken(c, 0.3)}" stroke-width="2" opacity=".9"/>`;

function sparkle(x: number, y: number, s: number, color = "#F9B52C") {
  // three short ticks, echoing the sparkles in the logo
  return `<g stroke="${color}" stroke-width="${s * 0.16}" stroke-linecap="round">
    <line x1="${x}" y1="${y - s * 0.3}" x2="${x - s * 0.18}" y2="${y - s}"/>
    <line x1="${x + s * 0.3}" y1="${y}" x2="${x + s}" y2="${y - s * 0.35}"/>
    <line x1="${x - s * 0.3}" y1="${y + s * 0.05}" x2="${x - s * 0.95}" y2="${y - s * 0.2}"/>
  </g>`;
}

function star4(x: number, y: number, r: number, color: string, opacity = 1) {
  const k = r * 0.28;
  return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${color}" opacity="${opacity}"/>`;
}

function heartPath(hx: number, hy: number, s: number) {
  return `M${hx} ${hy + s * 0.9} C${hx - s * 1.45} ${hy + s * 0.05} ${hx - s * 0.75} ${hy - s * 0.95} ${hx} ${hy - s * 0.28} C${hx + s * 0.75} ${hy - s * 0.95} ${hx + s * 1.45} ${hy + s * 0.05} ${hx} ${hy + s * 0.9}`;
}

function spool(x: number, y: number, s: number, thread = "#EDAF4B") {
  const w = 70 * s;
  const h = 96 * s;
  const lines = Array.from({ length: 7 }, (_, i) => {
    const yy = y - h / 2 + 18 * s + i * ((h - 36 * s) / 6);
    return `<path d="M${x - w / 2 + 4} ${yy} Q${x} ${yy + 7 * s} ${x + w / 2 - 4} ${yy}" stroke="${darken(thread, 0.18)}" stroke-width="${2 * s}" fill="none" opacity=".55"/>`;
  }).join("");
  const wood = "#D9B48F";
  return `<g>
    <ellipse cx="${x + 10 * s}" cy="${y + h / 2 + 10 * s}" rx="${w * 0.75}" ry="${14 * s}" fill="#3b2618" opacity=".12"/>
    <rect x="${x - w / 2}" y="${y - h / 2 + 10 * s}" width="${w}" height="${h - 20 * s}" fill="${thread}"/>
    ${lines}
    <ellipse cx="${x}" cy="${y + h / 2}" rx="${w * 0.62}" ry="${14 * s}" fill="${darken(wood, 0.12)}"/>
    <ellipse cx="${x}" cy="${y - h / 2 + 4 * s}" rx="${w * 0.62}" ry="${14 * s}" fill="${wood}"/>
    <ellipse cx="${x}" cy="${y - h / 2 + 4 * s}" rx="${9 * s}" ry="${4 * s}" fill="${darken(wood, 0.35)}"/>
  </g>`;
}

function folded(x: number, y: number, w: number, h: number, color: string, rot = 0, collar = true) {
  const d = darken(color, 0.14);
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
    <rect x="${x + 6}" y="${y + 14}" width="${w}" height="${h}" rx="18" fill="#3b2618" opacity=".12"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${color}"/>
    <path d="M${x + 22} ${y + h * 0.55} L${x + w - 22} ${y + h * 0.55}" stroke="${d}" stroke-width="2" opacity=".5"/>
    ${collar ? `<path d="M${x + w / 2 - 54} ${y} Q${x + w / 2} ${y + 46} ${x + w / 2 + 54} ${y}" fill="${darken(color, 0.22)}" opacity=".85"/>` : ""}
    ${stitch(`M${x + 16} ${y + h - 14} L${x + w - 16} ${y + h - 14}`, d, 2)}
  </g>`;
}

function hanger(cx: number, shoulderY: number, scale: number) {
  const wood = "#C99A6E";
  const s = scale;
  return `<g>
    <path d="M${cx} ${shoulderY - 58 * s} L${cx} ${shoulderY - 98 * s} Q${cx} ${shoulderY - 134 * s} ${cx + 24 * s} ${shoulderY - 134 * s} Q${cx + 48 * s} ${shoulderY - 134 * s} ${cx + 48 * s} ${shoulderY - 110 * s}" fill="none" stroke="#B89A6A" stroke-width="${7 * s}" stroke-linecap="round"/>
    <path d="M${cx - 170 * s} ${shoulderY + 4 * s} Q${cx} ${shoulderY - 80 * s} ${cx + 170 * s} ${shoulderY + 4 * s}" fill="none" stroke="${wood}" stroke-width="${16 * s}" stroke-linecap="round"/>
  </g>`;
}

/* --------------------------------- patterns -------------------------------- */
function patternDef(id: string, kind: "dots" | "stripes" | "stars", base: string) {
  const fg = lum(base) > 0.6 ? darken(base, 0.28) : lighten(base, 0.55);
  if (kind === "dots")
    return `<pattern id="${id}" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="5" fill="${fg}" opacity=".7"/><circle cx="33" cy="33" r="5" fill="${fg}" opacity=".7"/></pattern>`;
  if (kind === "stripes")
    return `<pattern id="${id}" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="12" fill="${fg}" opacity=".45"/></pattern>`;
  return `<pattern id="${id}" width="72" height="72" patternUnits="userSpaceOnUse">${star4(18, 18, 8, fg, 0.8)}${star4(54, 54, 6, fg, 0.8)}</pattern>`;
}

/* ---------------------------------- garment -------------------------------- */
type GOpts = { color: string; accent?: string; pattern?: "dots" | "stripes" | "stars"; collar?: boolean; pocket?: boolean };

function frill(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, depth: number, color: string) {
  // band hanging below a quadratic hem, with a scalloped edge
  const n = 14;
  const pt = (t: number) => [
    (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1,
    (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1,
  ];
  let d = `M${x0} ${y0 - 20}`;
  for (let i = 0; i <= n; i++) {
    const [x, y] = pt(i / n);
    d += ` L${x} ${y - 20}`;
  }
  for (let i = n; i > 0; i--) {
    const [xa, ya] = pt(i / n);
    const [xb, yb] = pt((i - 1) / n);
    d += ` L${xa} ${ya + depth} Q${(xa + xb) / 2} ${(ya + yb) / 2 + depth + 22} ${xb} ${yb + depth}`;
  }
  return `<path d="${d} Z" fill="${color}"/>`;
}

function garmentDetails(kind: GarmentKind, o: GOpts) {
  const c = o.color;
  const dk = darken(c, 0.16);
  const dk2 = darken(c, 0.32);
  const lt = lighten(c, 0.35);
  const acc = o.accent ?? (lum(c) > 0.7 ? "#C99A6E" : lighten(c, 0.6));
  const under: string[] = [];
  const over: string[] = [];
  const neck = () => {
    over.push(`<path d="M232 72 Q300 118 368 72 Q300 84 232 72Z" fill="${dk2}"/>`);
    over.push(`<path d="M226 70 Q300 132 374 70" fill="none" stroke="${dk}" stroke-width="10" stroke-linecap="round" opacity=".55"/>`);
  };
  const sideShade = (bottom = 552) =>
    over.push(
      `<path d="M144 226 Q190 380 166 ${bottom - 4} L142 ${bottom} Z" fill="${dk}" opacity=".35"/><path d="M456 226 Q410 380 434 ${bottom - 4} L458 ${bottom} Z" fill="${dk}" opacity=".35"/>`,
    );
  const longCuffs = (a: [number, number][], b: [number, number][]) => {
    for (const poly of [a, b]) over.push(`<path d="M${poly.map((p) => p.join(" ")).join(" L")} Z" fill="${dk}" opacity=".55"/>`);
  };
  const collar = () => {
    over.push(`<path d="M226 72 Q226 150 298 132 Q262 108 226 72Z" fill="${lighten(acc, 0.2)}" stroke="${darken(acc, 0.2)}" stroke-width="2"/>`);
    over.push(`<path d="M374 72 Q374 150 302 132 Q338 108 374 72Z" fill="${lighten(acc, 0.2)}" stroke="${darken(acc, 0.2)}" stroke-width="2"/>`);
  };

  switch (kind) {
    case "tee":
    case "polo":
      neck();
      sideShade();
      over.push(stitch("M552 180 L494 251", dk2), stitch("M48 180 L106 251", dk2), stitch("M146 534 Q300 554 454 534", dk2));
      if (o.pocket) over.push(`<rect x="352" y="188" width="62" height="70" rx="6" fill="${dk}" opacity=".35"/>`, stitch("M356 202 L410 202", dk2, 2));
      if (kind === "polo") {
        over.push(`<path d="M226 70 L300 130 L268 160 L204 96 Z" fill="${lt}" stroke="${dk}" stroke-width="2"/>`);
        over.push(`<path d="M374 70 L300 130 L332 160 L396 96 Z" fill="${lt}" stroke="${dk}" stroke-width="2"/>`);
        over.push(`<rect x="288" y="128" width="24" height="104" rx="4" fill="${dk}" opacity=".45"/>`);
        over.push(button(300, 156, 8, lt), button(300, 200, 8, lt));
      }
      break;
    case "sweat":
    case "hoodie":
    case "cardigan": {
      sideShade();
      longCuffs(
        [[574, 458], [578, 482], [512, 496], [506, 470]],
        [[26, 458], [22, 482], [88, 496], [94, 470]],
      );
      over.push(`<path d="M134 524 Q300 544 466 524 L466 552 Q300 572 134 552 Z" fill="${dk}" opacity=".45"/>`);
      if (kind === "sweat") neck();
      if (kind === "hoodie") {
        under.push(`<path d="M188 104 Q176 2 300 -4 Q424 2 412 104 Z" fill="${dk}"/>`);
        over.push(`<path d="M230 76 Q234 20 300 16 Q366 20 370 76 Q300 126 230 76Z" fill="${dk2}"/>`);
        over.push(`<path d="M284 118 L278 214 M316 118 L322 214" stroke="${lt}" stroke-width="5" stroke-linecap="round"/>`);
        over.push(`<path d="M196 392 L404 392 L436 516 L164 516 Z" fill="${dk}" opacity=".3"/>`, stitch("M200 404 L400 404", dk2, 2));
      }
      if (kind === "cardigan") {
        over.push(`<path d="M232 72 Q300 84 368 72 L300 238 Z" fill="${dk2}"/>`);
        over.push(`<path d="M226 70 L300 244 L374 70" fill="none" stroke="${dk}" stroke-width="12" opacity=".5"/>`);
        over.push(`<path d="M300 240 L300 552" stroke="${dk2}" stroke-width="3"/>`);
        for (const y of [270, 330, 390, 450, 508]) over.push(button(316, y, 10, acc));
        over.push(`<rect x="170" y="418" width="84" height="74" rx="8" fill="${dk}" opacity=".35"/><rect x="346" y="418" width="84" height="74" rx="8" fill="${dk}" opacity=".35"/>`);
      }
      break;
    }
    case "romper":
      neck();
      over.push(stitch("M535 170 L484 236", dk2), stitch("M65 170 L116 236", dk2));
      over.push(stitch("M444 470 Q448 540 382 590", dk2), stitch("M156 470 Q152 540 218 590", dk2));
      over.push(`<path d="M150 216 Q196 380 170 520 L146 460Z" fill="${dk}" opacity=".3"/><path d="M450 216 Q404 380 430 520 L454 460Z" fill="${dk}" opacity=".3"/>`);
      over.push(snap(270, 614, c), snap(300, 614, c), snap(330, 614, c));
      if (o.collar) collar();
      else over.push(button(300, 150, 9, acc), button(300, 190, 9, acc));
      break;
    case "sleepsuit":
      neck();
      longCuffs(
        [[571, 448], [574, 470], [512, 484], [507, 462]],
        [[29, 448], [26, 470], [88, 484], [93, 462]],
      );
      over.push(`<path d="M126 724 L280 728 L278 770 Q276 794 256 794 L180 794 Q124 792 126 740Z" fill="${dk}" opacity=".5"/>`);
      over.push(`<path d="M474 724 L320 728 L322 770 Q324 794 344 794 L420 794 Q476 792 474 740Z" fill="${dk}" opacity=".5"/>`);
      for (let y = 150; y <= 540; y += 44) over.push(snap(300, y, c));
      break;
    case "dungaree":
    case "shortall": {
      const long = kind === "dungaree";
      over.push(`<path d="M204 150 L396 150 L410 320 L190 320Z" fill="${lt}" opacity=".18"/>`);
      if (o.pocket !== false) over.push(`<rect x="252" y="194" width="96" height="80" rx="8" fill="${dk}" opacity=".35"/>`, stitch("M258 208 L342 208", dk2, 2));
      over.push(stitch("M194 322 L406 322", dk2), stitch("M300 324 L300 470", dk2));
      over.push(`<path d="M196 340 Q234 380 216 432" stroke="${dk2}" stroke-width="3" fill="none" opacity=".6"/><path d="M404 340 Q366 380 384 432" stroke="${dk2}" stroke-width="3" fill="none" opacity=".6"/>`);
      if (long)
        over.push(`<path d="M146 690 L272 694 L270 724 L144 720Z" fill="${dk}" opacity=".5"/><path d="M330 694 L454 690 L456 720 L330 724Z" fill="${dk}" opacity=".5"/>`);
      else over.push(stitch("M144 544 L278 552", dk2), stitch("M456 544 L322 552", dk2));
      over.push(button(222, 152, 13, acc), button(378, 152, 13, acc));
      break;
    }
    case "dress":
      under.push(frill(44, 590, 300, 640, 556, 590, 34, o.accent ?? lighten(c, 0.3)));
      under.push(`<path d="M190 74 Q128 92 110 178 Q150 188 172 216 Q164 140 190 74Z" fill="${lt}"/><path d="M410 74 Q472 92 490 178 Q450 188 428 216 Q436 140 410 74Z" fill="${lt}"/>`);
      over.push(`<path d="M222 66 Q300 112 378 66 Q300 80 222 66Z" fill="${dk2}"/>`);
      over.push(stitch("M176 264 Q300 280 424 264", dk2));
      for (let i = 0; i < 7; i++) {
        const xa = 196 + i * 35;
        const xb = 90 + i * 70;
        over.push(`<path d="M${xa} 280 Q${(xa + xb) / 2 + (i % 2 ? 10 : -10)} 440 ${xb} 600" stroke="${dk}" stroke-width="3" fill="none" opacity=".35"/>`);
      }
      if (o.collar) collar();
      break;
    case "vest":
      over.push(`<path d="M222 62 Q300 44 378 62 L372 90 Q300 74 228 90Z" fill="${dk}"/>`);
      for (const y of [170, 250, 330, 410, 490]) over.push(`<path d="M${y < 230 ? 170 : 150} ${y} Q300 ${y + 18} ${y < 230 ? 430 : 452} ${y}" stroke="${dk2}" stroke-width="3" fill="none" opacity=".45"/>`);
      over.push(`<path d="M300 84 L300 556" stroke="${dk2}" stroke-width="4"/><rect x="292" y="98" width="16" height="34" rx="5" fill="${lt}" stroke="${dk2}" stroke-width="2"/>`);
      sideShade();
      break;
    case "shorts":
      over.push(`<path d="M150 60 L450 60 L452 104 L148 104Z" fill="${dk}" opacity=".5"/>`);
      over.push(`<path d="M294 106 Q270 150 262 168 M306 106 Q330 150 338 168" stroke="${lt}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      over.push(stitch("M300 106 L300 196", dk2), stitch("M130 312 L280 324", dk2), stitch("M470 312 L320 324", dk2));
      over.push(`<path d="M156 112 Q200 130 212 184" stroke="${dk2}" stroke-width="3" fill="none" opacity=".5"/><path d="M444 112 Q400 130 388 184" stroke="${dk2}" stroke-width="3" fill="none" opacity=".5"/>`);
      break;
    case "joggers":
      over.push(`<path d="M160 50 L440 50 L442 98 L158 98Z" fill="${dk}" opacity=".55"/>`);
      over.push(`<path d="M164 596 L262 600 L260 640 L162 636Z" fill="${dk}" opacity=".55"/><path d="M438 596 L340 600 L340 640 L438 636Z" fill="${dk}" opacity=".55"/>`);
      over.push(stitch("M300 100 L300 226", dk2));
      over.push(`<path d="M294 100 Q272 146 268 166 M306 100 Q328 146 332 166" stroke="${lt}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      break;
    case "skirt":
      under.push(frill(60, 400, 300, 452, 540, 400, 30, lighten(c, 0.35)));
      over.push(`<path d="M180 40 L420 40 L422 82 L178 82Z" fill="${dk}" opacity=".5"/>`);
      for (let i = 0; i < 8; i++) {
        const xa = 192 + i * 31;
        const xb = 90 + i * 60;
        over.push(`<path d="M${xa} 86 L${xb} 420" stroke="${dk}" stroke-width="3" opacity=".35"/>`);
      }
      break;
  }
  return { under: under.join(""), over: over.join("") };
}

function garment(kind: GarmentKind, o: GOpts) {
  const id = nextId("g");
  const outline = GARMENT_OUTLINE[kind];
  const det = garmentDetails(kind, o);
  const pat = o.pattern ? patternDef(`${id}p`, o.pattern, o.color) : "";
  return `<g>
    <defs>${pat}<clipPath id="${id}c"><path d="${outline}"/></clipPath></defs>
    <g transform="translate(10 22)" opacity=".22" filter="url(#soft)">${det.under ? `<g fill="#3b2618">${det.under.replace(/fill="[^"]*"/g, "")}</g>` : ""}<path d="${outline}" fill="#3b2618"/></g>
    ${det.under}
    <path d="${outline}" fill="${o.color}"/>
    ${o.pattern ? `<rect x="-50" y="-50" width="700" height="900" fill="url(#${id}p)" clip-path="url(#${id}c)"/>` : ""}
    <g clip-path="url(#${id}c)"><ellipse cx="300" cy="260" rx="170" ry="230" fill="#fff" opacity=".07"/></g>
    ${det.over}
  </g>`;
}

/** place a garment so its artboard is centred at (cx, cy) with given width */
function place(kind: GarmentKind, o: GOpts, cx: number, cy: number, width: number, rot = 0) {
  const s = GARMENT_SIZE[kind];
  const k = width / s.w;
  const h = (s.h - s.top) * k;
  return `<g transform="translate(${cx - width / 2} ${cy - h / 2 - s.top * k}) rotate(${rot} ${width / 2} ${h / 2 + s.top * k}) scale(${k})">${garment(kind, o)}</g>`;
}

/* ---------------------------------- canvas --------------------------------- */
function canvas(w: number, h: number, bg: string, body: string, opts: { tag?: boolean } = {}) {
  const tag = opts.tag !== false;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.07"/></feComponentTransfer></filter>
    <radialGradient id="light" cx=".42" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect width="${w}" height="${h}" fill="url(#light)"/>
  ${body}
  <rect width="${w}" height="${h}" filter="url(#grain)"/>
  ${
    tag
      ? `<g transform="translate(${Math.round(w * 0.045)} ${h - Math.round(w * 0.045) - 44})"><rect width="148" height="44" rx="22" fill="#FEFBF4" opacity=".94"/><text x="74" y="28.5" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="15" font-weight="700" letter-spacing="3.2" fill="#5B3A26">SAMPLE</text></g>`
      : ""
  }
</svg>`;
}

async function write(rel: string, svg: string, w: number, h: number) {
  const file = path.join(OUT, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg), { density: 72 }).resize(w, h).webp({ quality: 84, effort: 5 }).toFile(file);
}

/* --------------------------------- products -------------------------------- */
const W = 1080;
const H = 1350;

function productScene(p: SampleProduct, ci: number, view: "front" | "detail") {
  const col = p.colors[ci];
  const base: GOpts = { color: col.hex, pattern: p.pattern, collar: p.collar, pocket: p.pocket };
  let body = "";
  if (Array.isArray(p.garment)) {
    const [top, bottom] = p.garment;
    const second = col.second ?? col.hex;
    body += place(bottom, { ...base, color: second, pattern: p.pattern && top !== "tee" ? p.pattern : undefined }, W * 0.56, H * 0.66, bottom === "skirt" ? 560 : 500, 4);
    body += place(top, base, W * 0.45, H * 0.34, 600, -4);
  } else {
    const k = p.garment;
    const tall = GARMENT_SIZE[k].h - GARMENT_SIZE[k].top;
    const width = Math.min(780, (H * 0.74 * 600) / tall);
    body += place(k, base, W / 2, H * 0.5, width);
  }
  // little props make the flat-lay feel styled
  body += button(W * 0.86, H * 0.12, 22, lighten(col.hex, 0.45)) + button(W * 0.91, H * 0.19, 15, "#E2B07E");
  if (view === "detail") {
    body = `<g transform="translate(${W / 2} ${H * 0.42}) scale(2.1) translate(${-W / 2} ${-H * 0.32})">${body}</g>`;
  }
  return canvas(W, H, bgFor(col.hex), body);
}

/* -------------------------------- editorials ------------------------------- */
function categoryScene(kind: GarmentKind, o: GOpts, bg: string, extra = "") {
  const width = 620;
  const s = GARMENT_SIZE[kind];
  const k = width / s.w;
  const cy = H * 0.56;
  const h = (s.h - s.top) * k;
  const shoulderY = cy - h / 2 + (96 - s.top) * k - 6;
  return canvas(W, H, bg, `${hanger(W / 2, shoulderY, k * 1.1)}${place(kind, o, W / 2, cy, width)}${extra}`);
}

async function main() {
  console.log("Generating sample product images…");
  for (const p of SAMPLE_PRODUCTS) {
    for (let ci = 0; ci < p.colors.length; ci++) {
      await write(productImagePath(p.slug, ci, "front"), productScene(p, ci, "front"), W, H);
      if (ci === 0) await write(productImagePath(p.slug, ci, "detail"), productScene(p, ci, "detail"), W, H);
    }
  }

  console.log("Generating category & editorial images…");
  await write("samples/categories/baby-boys.webp", categoryScene("dungaree", { color: C.olive.hex, pocket: true }, BG.sage, sparkle(W * 0.8, H * 0.2, 46)), W, H);
  await write("samples/categories/baby-girls.webp", categoryScene("dress", { color: C.coral.hex, collar: true }, BG.coral, sparkle(W * 0.2, H * 0.22, 46)), W, H);
  await write("samples/categories/newborn.webp", categoryScene("sleepsuit", { color: C.oat.hex, pattern: "dots" }, BG.bear, star4(W * 0.82, H * 0.24, 22, "#F9B52C")), W, H);
  await write("samples/categories/everyday-wear.webp", categoryScene("tee", { color: C.butter.hex, pocket: true }, BG.mist, button(W * 0.8, H * 0.86, 26, "#F4A88C")), W, H);
  await write("samples/categories/casual-outfits.webp", categoryScene("polo", { color: C.sage.hex }, BG.cream), W, H);
  await write("samples/categories/matching-sets.webp", canvas(W, H, BG.sun, place("shorts", { color: C.olive.hex }, W * 0.56, H * 0.68, 500, 4) + place("tee", { color: C.butter.hex }, W * 0.45, H * 0.34, 600, -4)), W, H);
  await write("samples/categories/seasonal.webp", categoryScene("cardigan", { color: C.honey.hex }, BG.sageLight), W, H);

  // Brand story: folded stack + spool with the golden thread turning into a heart
  const EW = 1200;
  const EH = 1500;
  const story = canvas(
    EW,
    EH,
    BG.cream,
    `${folded(250, 820, 560, 150, C.cocoa.hex, -3, false)}
     ${folded(270, 700, 540, 150, C.sage.hex, 2)}
     ${folded(240, 585, 560, 150, C.coral.hex, -2)}
     ${folded(290, 470, 500, 140, C.oat.hex, 1)}
     ${spool(910, 1130, 1.6)}
     <path d="M880 1060 C800 960 980 880 900 760 C850 690 760 700 740 620" fill="none" stroke="#EDAF4B" stroke-width="5" stroke-linecap="round"/>
     <path d="${heartPath(735, 545, 62)}" fill="none" stroke="#EDAF4B" stroke-width="5" stroke-linecap="round"/>
     ${button(250, 1180, 30, "#F7CD6B")}${button(330, 1240, 22, "#8A9E72")}${button(190, 1260, 18, "#F4A88C")}
     ${sparkle(980, 380, 52)}`,
  );
  await write("samples/editorial-story.webp", story, EW, EH);

  const detail = canvas(
    EW,
    EH,
    "#E7ECDF",
    `<path d="M-40 1600 L-40 380 Q300 300 700 420 Q1000 520 1300 380 L1300 1600Z" fill="${C.sage.hex}"/>
     <path d="M-40 380 Q300 300 700 420 Q1000 520 1300 380" fill="none" stroke="${darken(C.sage.hex, 0.25)}" stroke-width="5" stroke-dasharray="16 12" transform="translate(0 40)"/>
     <rect x="520" y="430" width="120" height="1100" fill="${darken(C.sage.hex, 0.1)}" opacity=".6"/>
     ${button(580, 650, 48, "#F1E6D0")}${button(580, 900, 48, "#F1E6D0")}${button(580, 1150, 48, "#F1E6D0")}
     ${spool(250, 260, 1.4, "#F4A88C")}
     <path d="M300 300 C420 380 380 520 300 560 C220 600 200 720 300 760" fill="none" stroke="#EDAF4B" stroke-width="5" stroke-linecap="round"/>
     <path d="${heartPath(930, 230, 70)}" fill="none" stroke="#EDAF4B" stroke-width="5" stroke-linecap="round"/>
     ${sparkle(1030, 120, 40)}`,
  );
  await write("samples/editorial-detail.webp", detail, EW, EH);

  console.log("Generating gallery images…");
  const G = 1080;
  const gallery: [string, string][] = [
    ["g1", canvas(G, G, BG.sun, `${hanger(G / 2, 290, 0.85)}${place("dress", { color: C.coral.hex, collar: true }, G / 2, 560, 470)}${sparkle(860, 200, 44)}`)],
    ["g2", canvas(G, G, BG.sage, `${place("shorts", { color: C.cocoa.hex }, 600, 720, 400, 6)}${place("tee", { color: C.oat.hex, pocket: true }, 470, 400, 470, -6)}${button(880, 880, 26, "#F7CD6B")}`)],
    ["g3", canvas(G, G, BG.bear, `${folded(260, 640, 560, 140, C.olive.hex, -2, false)}${folded(280, 520, 520, 140, C.butter.hex, 3)}${folded(250, 400, 560, 140, C.rose.hex, -1)}${sparkle(840, 260, 48)}`)],
    ["g4", canvas(G, G, BG.cream, `${spool(330, 420, 1.5)}<path d="M360 470 C460 560 600 520 640 620 C680 720 600 760 660 820" fill="none" stroke="#EDAF4B" stroke-width="5" stroke-linecap="round"/><path d="${heartPath(700, 330, 80)}" fill="none" stroke="#EDAF4B" stroke-width="5"/>${button(300, 800, 40, "#8A9E72")}${button(420, 870, 28, "#F4A88C")}${button(820, 860, 34, "#F7CD6B")}`)],
    ["g5", canvas(G, G, BG.coral, `${place("sleepsuit", { color: C.oat.hex, pattern: "stars" }, G / 2, G / 2 + 10, 420)}`)],
    ["g6", canvas(G, G, BG.sun, `${place("dungaree", { color: C.olive.hex, pocket: true }, G / 2, G / 2 + 20, 470)}${star4(820, 220, 26, "#F9B52C")}`)],
    ["g7", canvas(G, G, BG.sageLight, `${place("hoodie", { color: C.honey.hex }, G / 2, G / 2 + 10, 600)}`)],
    ["g8", canvas(G, G, BG.bear, `${place("joggers", { color: C.cocoa.hex, pattern: "stars" }, 630, 640, 360, 8)}${place("sweat", { color: C.cocoa.hex, pattern: "stars" }, 450, 420, 500, -6)}`)],
  ];
  for (const [name, svg] of gallery) await write(`samples/gallery/${name}.webp`, svg, G, G);

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
