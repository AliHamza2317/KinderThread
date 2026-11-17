/**
 * Illustrative garment silhouettes (SVG path data, 600-unit wide artboards).
 * Shared by the sample-image generator and the 3D wardrobe so both speak the
 * same visual language. These are NOT product replicas.
 */
export type GarmentKind =
  | "tee"
  | "polo"
  | "sweat"
  | "hoodie"
  | "cardigan"
  | "romper"
  | "sleepsuit"
  | "dungaree"
  | "shortall"
  | "dress"
  | "vest"
  | "shorts"
  | "joggers"
  | "skirt";

export const GARMENT_SIZE: Record<GarmentKind, { w: number; h: number; top: number }> = {
  tee: { w: 600, h: 600, top: 60 },
  polo: { w: 600, h: 600, top: 60 },
  sweat: { w: 600, h: 600, top: 60 },
  hoodie: { w: 600, h: 600, top: 0 },
  cardigan: { w: 600, h: 600, top: 60 },
  romper: { w: 600, h: 660, top: 60 },
  sleepsuit: { w: 600, h: 820, top: 60 },
  dungaree: { w: 600, h: 740, top: 20 },
  shortall: { w: 600, h: 590, top: 20 },
  dress: { w: 600, h: 660, top: 55 },
  vest: { w: 600, h: 600, top: 50 },
  shorts: { w: 600, h: 360, top: 50 },
  joggers: { w: 600, h: 660, top: 40 },
  skirt: { w: 600, h: 470, top: 30 },
};

export const GARMENT_OUTLINE: Record<GarmentKind, string> = {
  tee: "M228 70 Q300 128 372 70 L452 96 L566 190 L508 262 L456 226 L458 552 Q300 572 142 552 L144 226 L92 262 L34 190 L148 96 Z",
  polo: "M228 70 Q300 128 372 70 L452 96 L566 190 L508 262 L456 226 L458 552 Q300 572 142 552 L144 226 L92 262 L34 190 L148 96 Z",
  sweat:
    "M228 70 Q300 128 372 70 L452 98 Q520 130 548 300 L578 482 L512 496 L470 320 L466 552 Q300 572 134 552 L130 320 L88 496 L22 482 L52 300 Q80 130 148 98 Z",
  hoodie:
    "M228 70 Q300 128 372 70 L452 98 Q520 130 548 300 L578 482 L512 496 L470 320 L466 552 Q300 572 134 552 L130 320 L88 496 L22 482 L52 300 Q80 130 148 98 Z",
  cardigan:
    "M228 70 Q300 128 372 70 L452 98 Q520 130 548 300 L578 482 L512 496 L470 320 L466 552 Q300 572 134 552 L130 320 L88 496 L22 482 L52 300 Q80 130 148 98 Z",
  romper:
    "M228 70 Q300 128 372 70 L450 96 L548 180 L496 246 L452 216 L456 456 Q462 548 388 604 L348 630 L252 630 L212 604 Q138 548 144 456 L148 216 L104 246 L52 180 L150 96 Z",
  sleepsuit:
    "M228 70 Q300 128 372 70 L452 98 Q520 130 546 290 L574 470 L512 484 L472 310 L468 520 L474 740 Q476 792 420 794 L344 794 Q324 794 322 770 L306 560 L294 560 L278 770 Q276 794 256 794 L180 794 Q124 792 126 740 L132 520 L128 310 L88 484 L26 470 L54 290 Q80 130 148 98 Z",
  dungaree:
    "M204 150 L210 30 L238 30 L236 150 L364 150 L362 30 L390 30 L396 150 L410 320 L440 470 L456 720 L330 724 L306 520 L294 520 L270 724 L144 720 L160 470 L190 320 Z",
  shortall:
    "M204 150 L210 30 L238 30 L236 150 L364 150 L362 30 L390 30 L396 150 L410 320 L442 470 L460 560 L322 568 L304 474 L296 474 L278 568 L140 560 L158 470 L190 320 Z",
  dress:
    "M218 64 Q300 118 382 64 L412 72 Q404 150 432 214 L424 262 L556 590 Q300 640 44 590 L176 262 L168 214 Q196 150 188 72 Z",
  vest: "M228 70 Q300 128 372 70 L430 84 Q420 170 452 226 L458 552 Q300 572 142 552 L148 226 Q180 170 170 84 Z",
  shorts: "M150 60 L450 60 L474 330 L322 342 L300 196 L278 342 L126 330 Z",
  joggers: "M160 50 L440 50 L456 300 L438 636 L340 640 L306 230 L294 230 L260 640 L162 636 L144 300 Z",
  skirt: "M180 40 L420 40 L422 82 L540 400 Q300 452 60 400 L178 82 Z",
};
