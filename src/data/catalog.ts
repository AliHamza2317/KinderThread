/**
 * DUMMY catalogue for the frontend-only build (no database yet).
 *
 * Products here are sample listings (`isSample: true`) shown with a discreet
 * "Sample" note. Photos are free-licence stock photography (Unsplash Licence,
 * see public/images/CREDITS.md) used as placeholders — they are NOT photos of
 * Kinder Thread products. When the MongoDB backend is added, this file is
 * replaced by real data from the database.
 */
import type { Category, Product, SizeGuide } from "@/lib/types";

type SampleColor = { name: string; hex: string; images: string[] };
type SampleProduct = {
  slug: string;
  code: string;
  name: string;
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

const ALL = ["0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2-3Y", "3-4Y", "4-5Y"];
const from = (start: string, end = "4-5Y") => ALL.slice(ALL.indexOf(start), ALL.indexOf(end) + 1);
const img = (name: string) => `/images/products/${name}.webp`;

const CATEGORY_DEFS = [
  { slug: "baby-boys", name: "Baby Boys", kind: "category", featured: true, image: "/images/editorial/cat-baby-boys.webp", description: "Easy, considered pieces for little boys — soft shirts, knits and everyday tees." },
  { slug: "baby-girls", name: "Baby Girls", kind: "category", featured: true, image: "/images/editorial/cat-baby-girls.webp", description: "Dresses, blouses and knits for little girls, in soft and timeless colours." },
  { slug: "newborn", name: "Newborn", kind: "category", featured: true, image: "/images/editorial/cat-newborn.webp", description: "Gentle first pieces for the very first days — bodysuits, knits and booties." },
  { slug: "everyday-wear", name: "Everyday Wear", kind: "category", featured: true, image: "/images/editorial/cat-everyday.webp", description: "Comfortable essentials for crawling, playing, napping and growing." },
  { slug: "casual-outfits", name: "Casual Outfits", kind: "category", featured: false, image: "/images/editorial/cat-casual.webp", description: "Relaxed looks for playdates, park days and family visits." },
  { slug: "matching-sets", name: "Matching Sets", kind: "collection", featured: false, image: "/images/editorial/cat-matching-sets.webp", description: "Coordinated pieces that work together — one less decision in the morning." },
  { slug: "seasonal", name: "Seasonal Collection", kind: "collection", featured: false, image: "/images/editorial/cat-seasonal.webp", description: "Knits and layers for cooler days." },
] as const;

const PRODUCT_DEFS: SampleProduct[] = [
  {
    slug: "linen-grandad-shirt",
    code: "LGS",
    name: "Linen Grandad Shirt",
    colors: [
      { name: "Stone", hex: "#B5AFA5", images: [img("linen-shirt-stone")] },
      { name: "Ivory", hex: "#EEE8DC", images: [img("linen-shirt-ivory")] },
      { name: "Sky", hex: "#BDC9D5", images: [img("linen-shirt-sky")] },
    ],
    price: 2490,
    gender: "BOY",
    categories: ["baby-boys", "casual-outfits", "everyday-wear"],
    sizes: from("12-18M"),
    newArrival: true,
    featured: true,
    description: "A relaxed short-sleeve shirt with a grandad collar and a soft, breathable feel. Easy to dress up for family visits or down for the park.",
    fabric: "Linen-cotton blend",
  },
  {
    slug: "nordic-yoke-cardigan",
    code: "NYC",
    name: "Nordic Yoke Cardigan",
    colors: [{ name: "Rose", hex: "#B5726B", images: [img("nordic-cardigan-rose")] }],
    price: 3490,
    gender: "GIRL",
    categories: ["baby-girls", "seasonal"],
    sizes: from("12-18M"),
    newArrival: true,
    bestSeller: true,
    description: "A button-front cardigan with a patterned yoke — a warm layer over dresses and tees on cooler mornings.",
    fabric: "Soft knit",
  },
  {
    slug: "chunky-knit-sweater",
    code: "CKS",
    name: "Chunky Knit Sweater",
    colors: [{ name: "Rust", hex: "#A35C3F", images: [img("chunky-sweater-rust"), img("chunky-sweater-rust-2")] }],
    price: 3190,
    gender: "UNISEX",
    categories: ["seasonal", "baby-boys", "everyday-wear"],
    sizes: from("12-18M"),
    bestSeller: true,
    description: "A cosy raglan-sleeve sweater with ribbed cuffs and hem, made for layering through the cooler months.",
    fabric: "Chunky knit",
  },
  {
    slug: "cable-knit-bloomers",
    code: "CKB",
    name: "Cable Knit Bloomers",
    colors: [{ name: "Moss", hex: "#4E6A3A", images: [img("knit-bloomers-moss")] }],
    price: 1890,
    gender: "UNISEX",
    categories: ["newborn", "baby-boys"],
    sizes: from("0-3M", "12-18M"),
    newArrival: true,
    description: "Soft knitted bloomers with an elasticated waist — lovely with a bodysuit or cardigan.",
    fabric: "Knitted",
  },
  {
    slug: "knitted-hat-mitten-set",
    code: "HMS",
    name: "Knitted Hat & Mitten Set",
    colors: [{ name: "Snow", hex: "#F1F0EC", images: [img("hat-mittens-snow")] }],
    price: 1690,
    gender: "UNISEX",
    categories: ["newborn", "seasonal", "matching-sets"],
    sizes: from("0-3M", "18-24M"),
    description: "A textured knit hat with matching thumbless mittens to keep little hands and ears warm.",
    fabric: "Soft knit",
  },
  {
    slug: "ribbed-knit-beanie",
    code: "RKB",
    name: "Ribbed Knit Beanie",
    colors: [{ name: "Berry", hex: "#9E3A78", images: [img("ribbed-beanie-berry")] }],
    price: 990,
    gender: "UNISEX",
    categories: ["seasonal"],
    sizes: ["6-9M", "12-18M", "2-3Y", "4-5Y"],
    description: "A classic ribbed beanie with a deep turn-up cuff.",
    fabric: "Ribbed knit",
  },
  {
    slug: "hand-crochet-booties",
    code: "HCB",
    name: "Hand-Crochet Booties",
    colors: [
      { name: "Coral", hex: "#E38B76", images: [img("crochet-booties-coral")] },
      { name: "Cream", hex: "#F0E7D7", images: [img("crochet-booties-cream"), img("crochet-booties-cream-2")] },
    ],
    price: 1290,
    gender: "UNISEX",
    categories: ["newborn"],
    sizes: from("0-3M", "9-12M"),
    bestSeller: true,
    description: "Soft crocheted booties with a button strap, for the first months before first steps.",
    fabric: "Crocheted yarn",
  },
  {
    slug: "everyday-crew-tee",
    code: "ECT",
    name: "Everyday Crew Tee",
    colors: [{ name: "Melange Blue", hex: "#AFC3D6", images: [img("crew-tee-grey")] }],
    price: 1190,
    gender: "UNISEX",
    categories: ["everyday-wear", "casual-outfits", "baby-boys"],
    sizes: from("9-12M"),
    description: "A soft crew-neck tee with a relaxed fit — the one they'll reach for every day.",
    fabric: "Cotton jersey",
  },
  {
    slug: "lace-occasion-dress",
    code: "LOD",
    name: "Lace Occasion Dress",
    colors: [{ name: "Ivory", hex: "#F3EEE3", images: [img("lace-dress-ivory"), img("lace-dress-ivory-2")] }],
    price: 4290,
    compareAtPrice: 4990,
    gender: "GIRL",
    categories: ["baby-girls"],
    sizes: from("6-9M", "3-4Y"),
    featured: true,
    description: "A delicate dress with flutter sleeves and a lace overlay, for birthdays, weddings and family celebrations.",
    fabric: "Lace with cotton lining",
  },
  {
    slug: "polka-dot-smock-dress",
    code: "PDS",
    name: "Polka Dot Smock Dress",
    colors: [{ name: "Lilac", hex: "#CDB5CE", images: [img("dot-smock-dress-lilac")] }],
    price: 3290,
    gender: "GIRL",
    categories: ["baby-girls", "casual-outfits"],
    sizes: from("12-18M"),
    newArrival: true,
    description: "A sweet long-sleeve smock dress with a rounded collar and a scattering of dots.",
    fabric: "Cotton",
  },
  {
    slug: "tulle-party-dress",
    code: "TPD",
    name: "Tulle Party Dress",
    colors: [{ name: "Mint", hex: "#A8D2C3", images: [img("tulle-dress-mint")] }],
    price: 3790,
    compareAtPrice: 4290,
    gender: "GIRL",
    categories: ["baby-girls"],
    sizes: from("12-18M"),
    featured: true,
    bestSeller: true,
    description: "A party dress with a soft cotton bodice and a full tulle skirt that twirls just right.",
    fabric: "Cotton bodice, tulle skirt",
  },
  {
    slug: "printed-bodysuit-3-pack",
    code: "PB3",
    name: "Printed Bodysuit 3-Pack",
    colors: [{ name: "White Prints", hex: "#ECEEEF", images: [img("sleepsuit-set")] }],
    price: 2490,
    gender: "UNISEX",
    categories: ["newborn", "matching-sets", "everyday-wear"],
    sizes: from("0-3M", "12-18M"),
    newArrival: true,
    description: "Three soft bodysuits with gentle prints — an easy rotation for the first months.",
    fabric: "Cotton jersey",
  },
  {
    slug: "everyday-socks-5-pack",
    code: "ES5",
    name: "Everyday Socks 5-Pack",
    colors: [{ name: "Mixed", hex: "#E7A99E", images: [img("rainbow-socks")] }],
    price: 890,
    gender: "UNISEX",
    categories: ["everyday-wear"],
    sizes: ["0-3M", "6-9M", "12-18M", "2-3Y", "4-5Y"],
    description: "Five pairs of soft everyday socks in mixed colours.",
    fabric: "Cotton blend",
  },
  {
    slug: "frill-romper-bloomer-set",
    code: "FRB",
    name: "Frill Romper & Bloomer Set",
    colors: [{ name: "Cream", hex: "#EEE5D1", images: [img("linen-romper-set")] }],
    price: 2890,
    gender: "GIRL",
    categories: ["matching-sets", "newborn"],
    sizes: from("3-6M", "18-24M"),
    newArrival: true,
    description: "A sleeveless frill top with matching bloomers — a soft, easy set for warm days.",
    fabric: "Cotton gauze",
  },
];

const SIZE_ROWS = [
  { size: "0-3M", age: "0–3 months", height: "56–62", chest: "41", waist: "41", length: "35" },
  { size: "3-6M", age: "3–6 months", height: "62–68", chest: "43", waist: "43", length: "37" },
  { size: "6-9M", age: "6–9 months", height: "68–74", chest: "45", waist: "45", length: "39" },
  { size: "9-12M", age: "9–12 months", height: "74–80", chest: "47", waist: "46", length: "41" },
  { size: "12-18M", age: "12–18 months", height: "80–86", chest: "49", waist: "47", length: "43" },
  { size: "18-24M", age: "18–24 months", height: "86–92", chest: "51", waist: "48", length: "45" },
  { size: "2-3Y", age: "2–3 years", height: "92–98", chest: "53", waist: "49", length: "47" },
  { size: "3-4Y", age: "3–4 years", height: "98–104", chest: "55", waist: "50", length: "50" },
  { size: "4-5Y", age: "4–5 years", height: "104–110", chest: "57", waist: "51", length: "53" },
];

// Fixed reference date keeps server and client renders identical (no hydration drift).
const BASE = new Date("2026-11-01T10:00:00+05:00").getTime();
const DAY = 864e5;

export const SIZE_GUIDES: SizeGuide[] = [
  {
    id: "sg_standard",
    name: "Kinder Thread standard (0–5 years)",
    unit: "cm",
    isDefault: true,
    rows: SIZE_ROWS,
    notes: "Sample measurements — replace with the measurements from your supplier's size chart.",
    updatedAt: new Date(BASE),
  },
];

export const CATEGORIES: Category[] = CATEGORY_DEFS.map((c, i) => ({
  id: `cat_${c.slug}`,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.image,
  kind: c.kind,
  sortOrder: i,
  isVisible: true,
  showInNav: true,
  isFeatured: c.featured,
  seoTitle: null,
  seoDescription: null,
  createdAt: new Date(BASE - 30 * DAY),
  updatedAt: new Date(BASE - 30 * DAY),
}));

// deterministic pseudo-random stock levels
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export const PRODUCTS: Product[] = PRODUCT_DEFS.map((p, pi) => {
  const colors = p.colors.map((c, ci) => ({ id: `${p.code.toLowerCase()}_c${ci}`, name: c.name, hex: c.hex, sortOrder: ci }));
  let sort = 0;
  const images = p.colors.flatMap((c, ci) => c.images.map((url) => ({ id: `${p.code.toLowerCase()}_i${sort}`, url, alt: `${p.name} in ${c.name}`, sortOrder: sort++, colorId: colors[ci].id })));
  const variants = p.colors.flatMap((c, ci) => {
    const code = c.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
    return p.sizes.map((size) => {
      const r = rand();
      const stock = r < 0.08 ? 0 : r < 0.18 ? 2 : Math.floor(4 + rand() * 18);
      const sku = `KT-${p.code}-${code}-${size}`;
      return { id: `v_${sku}`, sku, size, colorId: colors[ci].id, price: null, stock, isActive: true };
    });
  });
  const created = new Date(BASE - (PRODUCT_DEFS.length - pi) * 7 * 36e5);
  return {
    id: `prod_${p.slug}`,
    name: p.name,
    slug: p.slug,
    description: p.description,
    fabric: p.fabric,
    care: "Machine wash cold, inside out. Do not bleach. Line dry in shade. Cool iron if needed.",
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    status: "ACTIVE",
    gender: p.gender,
    isSample: true,
    isFeatured: !!p.featured,
    isNewArrival: !!p.newArrival,
    isBestSeller: !!p.bestSeller,
    sortOrder: pi,
    seoTitle: null,
    seoDescription: null,
    sizeGuideId: SIZE_GUIDES[0].id,
    categoryIds: p.categories.map((slug) => `cat_${slug}`),
    images,
    colors,
    variants,
    createdAt: created,
    updatedAt: created,
  } satisfies Product;
});
