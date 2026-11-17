/**
 * SAMPLE catalogue used during development and pre-launch.
 * Every product created from this file is flagged `isSample = true` and every
 * image carries a visible "SAMPLE" tag. Delete them from /admin/products once
 * real Kinder Thread stock is photographed and uploaded.
 */
import type { GarmentKind } from "../src/lib/garment-paths";

export type SampleColor = { name: string; hex: string; second?: string };
export type SampleProduct = {
  slug: string;
  code: string;
  name: string;
  garment: GarmentKind | [GarmentKind, GarmentKind];
  pattern?: "dots" | "stripes" | "stars";
  collar?: boolean;
  pocket?: boolean;
  colors: SampleColor[];
  price: number;
  compareAtPrice?: number;
  gender: "BOY" | "GIRL" | "UNISEX";
  categories: string[];
  sizes: string[];
  newArrival?: boolean;
  bestSeller?: boolean;
  featured?: boolean;
  description: string;
  fabric: string;
};

export const C = {
  sage: { name: "Sage", hex: "#8A9E72" },
  olive: { name: "Olive", hex: "#667B52" },
  oat: { name: "Oat", hex: "#F1E6D0" },
  coral: { name: "Coral", hex: "#F4A88C" },
  butter: { name: "Butter", hex: "#F7CD6B" },
  cocoa: { name: "Cocoa", hex: "#7A5741" },
  honey: { name: "Honey", hex: "#E2B07E" },
  mist: { name: "Mist", hex: "#A9BFAF" },
  rose: { name: "Rose", hex: "#EBB2A6" },
} satisfies Record<string, SampleColor>;

const ALL = ["0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2-3Y", "3-4Y", "4-5Y"];
const from = (start: string, end = "4-5Y") => ALL.slice(ALL.indexOf(start), ALL.indexOf(end) + 1);

export const SAMPLE_CATEGORIES = [
  { slug: "baby-boys", name: "Baby Boys", kind: "category", featured: true, description: "Easy, playful outfits for little boys — from first rompers to weekend sets." },
  { slug: "baby-girls", name: "Baby Girls", kind: "category", featured: true, description: "Soft dresses, cardigans and sets for little girls, in colours that feel like sunshine." },
  { slug: "newborn", name: "Newborn", kind: "category", featured: true, description: "Gentle first outfits for the very first days — rompers, sleepsuits and bodysuits." },
  { slug: "everyday-wear", name: "Everyday Wear", kind: "category", featured: true, description: "Comfortable pieces for crawling, playing, napping and growing." },
  { slug: "casual-outfits", name: "Casual Outfits", kind: "category", featured: false, description: "Relaxed looks for playdates, park days and family visits." },
  { slug: "matching-sets", name: "Matching Sets", kind: "collection", featured: false, description: "Coordinated tops and bottoms — one less decision in the morning." },
  { slug: "seasonal", name: "Seasonal Collection", kind: "collection", featured: false, description: "Layers and warm pieces for cooler days." },
] as const;

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    slug: "cloud-knit-romper",
    code: "CKR",
    name: "Cloud Knit Romper",
    garment: "romper",
    colors: [C.oat, C.sage],
    price: 2290,
    gender: "UNISEX",
    categories: ["newborn", "everyday-wear"],
    sizes: from("0-3M", "12-18M"),
    newArrival: true,
    featured: true,
    description:
      "A soft, easy romper for the very first months. Shoulder snaps make changing simple, and the relaxed fit leaves room for kicking, stretching and wriggling.",
    fabric: "Soft cotton-blend knit",
  },
  {
    slug: "little-explorer-dungarees",
    code: "LED",
    name: "Little Explorer Dungarees",
    garment: "dungaree",
    pocket: true,
    colors: [C.olive, C.cocoa],
    price: 3490,
    gender: "BOY",
    categories: ["baby-boys", "casual-outfits"],
    sizes: from("6-9M"),
    newArrival: true,
    bestSeller: true,
    description:
      "Classic dungarees with button straps and a roomy bib pocket for treasures found on the way. Turn-up hems give a little extra length as they grow.",
    fabric: "Brushed cotton twill",
  },
  {
    slug: "petal-frill-dress",
    code: "PFD",
    name: "Petal Frill Dress",
    garment: "dress",
    collar: true,
    colors: [C.coral, C.oat],
    price: 3290,
    compareAtPrice: 3890,
    gender: "GIRL",
    categories: ["baby-girls"],
    sizes: from("6-9M"),
    bestSeller: true,
    featured: true,
    description:
      "A sweet everyday dress with a rounded collar, flutter sleeves and a soft frill hem that twirls just right.",
    fabric: "Lightweight cotton poplin",
  },
  {
    slug: "sunny-days-tee-shorts-set",
    code: "SDS",
    name: "Sunny Days Tee & Shorts Set",
    garment: ["tee", "shorts"],
    colors: [
      { name: "Butter & Olive", hex: C.butter.hex, second: C.olive.hex },
      { name: "Oat & Cocoa", hex: C.oat.hex, second: C.cocoa.hex },
    ],
    price: 2790,
    gender: "BOY",
    categories: ["baby-boys", "matching-sets", "casual-outfits"],
    sizes: from("9-12M"),
    newArrival: true,
    description: "A bright tee paired with comfy pull-on shorts. An easy, ready-to-go outfit for warm days.",
    fabric: "Cotton jersey tee · cotton twill shorts",
  },
  {
    slug: "bunny-hug-sleepsuit",
    code: "BHS",
    name: "Bunny Hug Sleepsuit",
    garment: "sleepsuit",
    pattern: "dots",
    colors: [C.oat, C.rose],
    price: 1990,
    gender: "UNISEX",
    categories: ["newborn"],
    sizes: from("0-3M", "12-18M"),
    bestSeller: true,
    description: "A cosy all-in-one with covered feet and front snaps from neck to toe — made for sleepy days and nights.",
    fabric: "Interlock cotton knit",
  },
  {
    slug: "everyday-cotton-tee",
    code: "ECT",
    name: "Everyday Cotton Tee",
    garment: "tee",
    pocket: true,
    colors: [C.oat, C.sage, C.coral],
    price: 1290,
    gender: "UNISEX",
    categories: ["everyday-wear", "casual-outfits"],
    sizes: from("6-9M"),
    bestSeller: true,
    description: "The tee they'll wear on repeat: a relaxed fit, a little chest pocket and a soft neckline that's easy over the head.",
    fabric: "Cotton jersey",
  },
  {
    slug: "cozy-knit-cardigan",
    code: "CKC",
    name: "Cozy Knit Cardigan",
    garment: "cardigan",
    colors: [C.honey, C.coral],
    price: 3190,
    gender: "GIRL",
    categories: ["baby-girls", "seasonal"],
    sizes: from("6-9M"),
    newArrival: true,
    description: "A button-front cardigan with patch pockets — the perfect layer over dresses and tees on cooler mornings.",
    fabric: "Soft acrylic-cotton knit",
  },
  {
    slug: "weekend-jogger-set",
    code: "WJS",
    name: "Weekend Jogger Set",
    garment: ["sweat", "joggers"],
    colors: [
      { name: "Cocoa", hex: C.cocoa.hex, second: C.cocoa.hex },
      { name: "Sage", hex: C.sage.hex, second: C.sage.hex },
    ],
    price: 3390,
    compareAtPrice: 3990,
    gender: "BOY",
    categories: ["baby-boys", "matching-sets", "casual-outfits"],
    sizes: from("12-18M"),
    bestSeller: true,
    description: "A matching sweatshirt and jogger set with ribbed cuffs. Easy on, easy off, easy to love.",
    fabric: "Cotton-rich fleece-back jersey",
  },
  {
    slug: "garden-party-dress",
    code: "GPD",
    name: "Garden Party Dress",
    garment: "dress",
    pattern: "stars",
    colors: [C.sage, C.butter],
    price: 3590,
    gender: "GIRL",
    categories: ["baby-girls"],
    sizes: from("12-18M"),
    newArrival: true,
    featured: true,
    description: "A little dress for special days, with a gathered waist, flutter sleeves and a scattering of tiny stars.",
    fabric: "Printed cotton voile",
  },
  {
    slug: "snuggle-bodysuit",
    code: "SBS",
    name: "Snuggle Bodysuit",
    garment: "romper",
    pattern: "stripes",
    colors: [C.oat, C.mist],
    price: 1490,
    gender: "UNISEX",
    categories: ["newborn", "everyday-wear"],
    sizes: from("0-3M", "18-24M"),
    description: "An everyday striped bodysuit with easy snaps — a wardrobe staple for the first two years.",
    fabric: "Stretch cotton rib",
  },
  {
    slug: "mini-polo-shirt",
    code: "MPS",
    name: "Mini Polo Shirt",
    garment: "polo",
    colors: [C.sage, C.oat],
    price: 1690,
    gender: "BOY",
    categories: ["baby-boys", "casual-outfits"],
    sizes: from("12-18M"),
    description: "A smart little polo with a soft collar and two-button placket, for family visits and photo days.",
    fabric: "Cotton piqué",
  },
  {
    slug: "twirl-skirt-set",
    code: "TSS",
    name: "Twirl Skirt Set",
    garment: ["tee", "skirt"],
    colors: [
      { name: "Coral & Oat", hex: C.oat.hex, second: C.coral.hex },
      { name: "Butter & Sage", hex: C.butter.hex, second: C.sage.hex },
    ],
    price: 2990,
    gender: "GIRL",
    categories: ["baby-girls", "matching-sets"],
    sizes: from("12-18M"),
    newArrival: true,
    description: "A soft tee with a frilled twirl skirt — made for spinning in circles.",
    fabric: "Cotton jersey tee · cotton skirt",
  },
  {
    slug: "puffer-vest",
    code: "PFV",
    name: "Little Puffer Vest",
    garment: "vest",
    colors: [C.olive, C.coral],
    price: 3790,
    gender: "UNISEX",
    categories: ["seasonal"],
    sizes: from("12-18M"),
    description: "A light quilted vest that keeps little cores warm while leaving arms free to explore.",
    fabric: "Quilted shell with soft padding",
  },
  {
    slug: "lounge-pyjama-set",
    code: "LPS",
    name: "Starry Lounge Pyjama Set",
    garment: ["sweat", "joggers"],
    pattern: "stars",
    colors: [
      { name: "Oat Stars", hex: C.oat.hex, second: C.oat.hex },
      { name: "Cocoa Stars", hex: C.cocoa.hex, second: C.cocoa.hex },
    ],
    price: 2690,
    gender: "UNISEX",
    categories: ["everyday-wear", "matching-sets"],
    sizes: from("12-18M"),
    description: "Cosy long-sleeve pyjamas with a tiny star print, for bedtime stories and slow mornings.",
    fabric: "Brushed cotton jersey",
  },
  {
    slug: "linen-look-shortall",
    code: "LLS",
    name: "Linen-look Shortall",
    garment: "shortall",
    pocket: true,
    colors: [C.mist, C.oat],
    price: 2890,
    gender: "BOY",
    categories: ["baby-boys", "casual-outfits"],
    sizes: from("6-9M", "3-4Y"),
    newArrival: true,
    description: "A breezy shortall with button straps — just add a tee for an instant warm-weather outfit.",
    fabric: "Cotton slub (linen-look)",
  },
  {
    slug: "fleece-hoodie",
    code: "FLH",
    name: "Snug Fleece Hoodie",
    garment: "hoodie",
    colors: [C.honey, C.sage],
    price: 2990,
    compareAtPrice: 3490,
    gender: "UNISEX",
    categories: ["seasonal", "everyday-wear"],
    sizes: from("12-18M"),
    bestSeller: true,
    description: "A soft hoodie with a front pocket for warm hands and a hood for breezy park days.",
    fabric: "Cotton-blend fleece",
  },
];

export const productImagePath = (slug: string, colorIndex: number, view: "front" | "detail") =>
  `/samples/products/${slug}-${colorIndex}-${view}.webp`;
