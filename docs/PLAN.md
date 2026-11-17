# Kinder Thread — Research, Creative Direction & Implementation Plan

> Phase 1 deliverable. This document records the decisions behind the build so that
> future designers and developers can extend the site without diluting the brand.

---

## 0. Research notes

**Logo analysis (source of truth for the design system).** The supplied logo is a
rounded, hand-friendly wordmark on a warm cream ground: a peeking teddy bear resting
its paws on the word *Kinder*, a golden thread that loops into a heart, small yellow
"sparkle" ticks, and a tracked uppercase tagline flanked by thin rules
(`— KIDS CLOTHING BRAND —`). Colours were sampled directly from the file:

| Token        | Hex       | Where it comes from in the logo |
|--------------|-----------|---------------------------------|
| `cream`      | `#FEFBF4` | Logo background                 |
| `sage`       | `#667B52` | Letter **K**                    |
| `sage-teal`  | `#69886C` | Letter **d**                    |
| `coral`      | `#F89776` | Letters **n**, **r**, bear cheeks |
| `sunshine`   | `#F9B52C` | Letters **i**, **e**, sparkles  |
| `honey`      | `#EDAF4B` | Thread heart                    |
| `cocoa`      | `#5B3A26` | *Thread* wordmark, outlines     |
| `bear`       | `#E8B58A` | Teddy bear fur                  |

**Reference study.** The listed galleries (Awwwards, Godly, 60fps, Scrolltide, 21st.dev,
Aceternity UI, Magic UI) consistently reward: one bold idea per page rather than many
effects; oversized editorial typography with generous negative space; scroll-linked
storytelling where motion explains structure; tactile micro-interactions on the
elements people actually use (buttons, cards, cart); and 3D used as a *hero moment*,
not as wallpaper. (The live sites could not be crawled from the build sandbox's
network, so this is based on the established patterns those platforms are known for;
no layout was copied.)

---

## 1. Creative direction — "Soft Editorial"

Kinder Thread should feel like a premium international kidswear label photographed for
a print magazine, with the warmth of a favourite plush toy. Two ideas carry the brand:

1. **The Peek‑a‑boo Bear.** The bear in the logo peeks over the wordmark. The hero
   recreates that moment in 3D: a soft plush bear rises from behind a stitched fabric
   cushion and rests its paws on the edge, following the visitor's cursor with its head.
2. **The Golden Thread.** The logo's thread‑heart becomes a recurring motif — a single
   honey-coloured line that draws itself as you scroll, stitching sections together and
   resolving into a heart at the newsletter sign-up. Used sparingly (3 places), never as
   decoration for its own sake.

Tone of voice: warm, short sentences; no exaggerated claims; no invented manufacturing
or sustainability promises.

## 2. Website design concept

* **Cream canvas, cocoa ink.** Text is set in cocoa rather than black, which keeps
  contrast high (AA+) while staying soft.
* **Editorial asymmetry.** 12‑column grid, large type, image-led sections that break
  the grid deliberately (offset images, overlapping captions).
* **Products first.** Shopping actions are always visible: hero CTA above the fold,
  sticky header with bag count, quick‑add on every card, sticky add-to-bag on mobile PDP.
* **Restraint.** No gradients on UI surfaces, no bordered "boxy" cards. Product cards are
  image + text; only images carry a soft radius. Buttons are pills to echo the rounded
  logo letterforms.
* **Honesty by design.** Sample products and placeholder imagery carry a visible
  *Sample* label until real stock and photography are uploaded.

## 3. Brand design system

**Colour roles (60/30/10).** Cream surfaces (60%), cocoa text + sage actions (30%),
coral / sunshine accents (10%: sale badges, highlights, sparkles). Each brand colour has
a tint scale (`50–900`) generated for backgrounds and hover states.

**Typography.**
* Display — **Fraunces** (variable, `SOFT` axis = 100): a soft-shouldered serif that reads
  as premium editorial yet friendly; italic for emphasis words.
* UI / body — **Nunito Sans** (variable): rounded terminals that echo the logo, excellent
  legibility at small sizes, supports `latin-ext`.
* Eyebrow labels echo the logo tagline: uppercase, `0.24em` tracking, flanked by rules.
* Fluid type scale with `clamp()`: display‑xl 56→120px, display 40→72px, h2 32→48px,
  h3 22→28px, body 16–17px, small 14px, micro 12px.

**Spacing & layout.** 4px base unit; section rhythm 96–160px desktop / 64–96px mobile;
container max 1440px with 20px (mobile) → 48px (desktop) gutters; 12‑column grid.

**Radii.** 999px buttons & chips · 24px media · 16px inputs/panels · no radius on page sections.

**Elevation.** Two soft shadows only (`shadow-soft`, `shadow-lift`) tinted with cocoa.

**Components.** Button (primary sage, secondary outline, ghost, link), IconButton,
Input/Select/Textarea with floating focus ring, Chip/Swatch, Badge (Sample, Sale, New,
Low stock), ProductCard, Drawer (cart, mobile menu, filters), Modal (quick add, size
guide, try‑on), Toasts, Accordion, Tabs, Breadcrumbs, Price, QuantityStepper, Empty states.

**Breakpoints.** `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` — mobile-first.

**Motion presets.** `ease-soft` cubic‑bezier(.22,1,.36,1) for reveals; `ease-bounce`
spring (stiffness 260, damping 20) for playful micro‑interactions; durations 160ms (UI),
480ms (component), 900ms (section reveals).

## 4. Homepage layout

| # | Section | Notes |
|---|---------|-------|
| A | Announcement bar | Rotating messages from admin; dismissible; links optional |
| B | Header | Logo, primary nav with mega-dropdown for Shop/Collections, search overlay, account, wishlist, animated bag |
| C | Hero | Split layout: headline + CTAs left, 3D Peek‑a‑boo Bear right; floating sewing buttons, sparkles and the thread-heart; static poster fallback |
| D | Featured categories | 4 tall editorial tiles with image zoom and subtle 3D tilt |
| E | New arrivals | Horizontal rail (drag/scroll-snap) of product cards with second-image hover |
| F | Brand story | "Made for Little Moments." — large type + offset imagery, golden thread draws on scroll |
| G | Little Wardrobe (3D) | Interactive wardrobe: doors open, rotate, pick a category hanger, recolour the illustrative silhouette, jump to real products |
| H | Best sellers | Grid with sale pricing |
| I | Why Kinder Thread | 5 genuine, deliverable benefits (no fake stats/testimonials) |
| J | Instagram gallery | Admin-managed images, "Follow Our Little World" |
| K | Newsletter | Real subscription with validation, duplicate handling, success/error states |
| L | Footer | Logo, description, shop links, support, policies, contact, socials, WhatsApp |

## 5. Animation strategy

| Tool | Used for |
|------|----------|
| **GSAP + ScrollTrigger** | Hero entrance timeline, headline word reveals, golden-thread stroke drawing, parallax of editorial imagery, section reveals |
| **Motion** | Drawers, modals, dropdowns, toasts, button/press feedback, cart badge bounce, card hovers, layout transitions (filters) |
| **React Three Fiber** | Bear idle (breathing, blink, ear twitch), cursor tracking, wardrobe doors/hangers |
| **CSS** | Hover colours, underline links, focus rings, image zoom |

Rules: animate *opacity/transform* only; no scroll-jacking; every effect is disabled or
reduced under `prefers-reduced-motion`; 3D render loops pause when off-screen.

## 6. 3D experience strategy

* **Procedural, not downloaded.** The bear and wardrobe are built from primitives in
  React Three Fiber, so they cost ~0 KB of model download and load instantly. The bear
  uses `MeshPhysicalMaterial` with *sheen* for a velvety plush look and a generated
  fabric bump texture; lighting comes from an in-scene Lightformer environment (no HDR
  download).
* **Loading.** Scenes are `next/dynamic` imports with `ssr:false`; a static poster image
  is the LCP element and cross-fades into the live canvas once ready.
* **Device tiers.** `full` (desktop/modern phones) → `lite` (fewer floating elements,
  DPR capped at 1.25, no shadows) → `static` (no WebGL, `saveData`, ≤2 GB memory, or reduced
  motion: poster only).
* **Wardrobe honesty.** Garments in the wardrobe are labelled *illustrative silhouettes*;
  the side panel always shows real catalogue products and real colour options. When
  photographed or 3D-scanned product assets exist, the model slot accepts a `.glb` per product.

## 7. Virtual try‑on feasibility

| Approach | Accuracy for ages 0–5 | Privacy | Cost / assets | Verdict |
|----------|----------------------|---------|---------------|---------|
| AI photo try-on APIs (diffusion based) | Trained mainly on adult models; infant/toddler proportions and poses give unreliable results | Requires uploading photos **of children** to a third-party processor — high sensitivity, parental consent, retention controls | Per-image API fees; clean product flat-lays per colour | Not recommended for launch |
| MediaPipe pose + 2D garment overlay (in-browser) | Pose models are unreliable on babies (lying/held/curled poses); overlay looks like a sticker | Good (on-device) | Needs segmented garment assets per colour | Low quality — would feel fake |
| WebAR body tracking | No production-grade infant body tracking | On-device | 3D garments required | Not feasible |
| **3D garment viewer + age-based size visualiser** | Accurate for *fit and size* questions — the real purchase blocker | Excellent — no photos | One `.glb` per style (CLO3D / Marvelous Designer / photogrammetry) | **Recommended Phase 2** |

**Decision:** we do **not** ship a fake try-on. The product page includes a clearly
labelled *"Virtual Try-On — coming later"* entry that explains the plan and lets parents
opt in to be notified (stored as a real subscriber with source `tryon`). The data model
already reserves a per-product 3D asset slot, and an admin toggle enables the feature
when assets exist. Phase 3 can add AI photo try-on with explicit consent, on-the-fly
processing and zero image retention if a vendor proves acceptable accuracy on toddlers.

## 8. Technology stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16 (App Router) + React 19 + TypeScript** | SSR/SEO, server actions for mutations, one deployable |
| Styling | **Tailwind CSS v4** with CSS-first `@theme` tokens | Design tokens in one file, tiny CSS output |
| Motion | **GSAP + ScrollTrigger**, **Motion**, CSS | Each used where it is strongest (see §5) |
| 3D | **three.js + React Three Fiber + Drei** | Declarative scenes, lazy-loaded |
| Database | **PostgreSQL + Prisma 7** (pg driver adapter) | Relational data (orders, variants, inventory), migrations, type safety |
| Auth | Own session auth: bcrypt hashes, random session tokens stored hashed in Postgres, httpOnly cookies, role checks on every server action | Simple, auditable, revocable; no third-party dependency |
| Validation | **Zod** on every server action | One schema for client hints and server enforcement |
| State | **Zustand** (persisted cart, wishlist, recently viewed) | Tiny; server re-prices every order |
| Media | Storage adapter: local disk (dev / VPS) or **Cloudinary** (recommended for production/serverless) | Swappable with an env var |
| Hosting | Vercel / any Node host + managed Postgres (Neon, Supabase, RDS) | |

Deliberately **not** used: a separate Node API server, GraphQL, Redux, a headless CMS
(content lives in Postgres and is edited in the admin).

## 9. Sitemap

```
/                         Home
/shop                     All products (filters, sort, search)
/collections/[slug]       Category & collection pages (baby-boys, baby-girls, newborn, …)
/products/[slug]          Product detail
/search?q=                Search results
/cart                     Bag
/checkout                 Checkout
/checkout/success/[no]    Order confirmation
/wishlist                 Wishlist
/track-order              Order tracking (order no. + phone)
/account                  Dashboard → /orders, /orders/[no], /addresses, /profile
/account/login · /register
/about                    Our story
/try-on                   Virtual try-on roadmap + notify me
/pages/[slug]             CMS pages: shipping, returns, faq, contact, privacy, terms, size-guide
/coming-soon              Pre-launch page (automatic when pre-launch mode is on)
/admin                    Dashboard
/admin/products · /new · /[id]
/admin/categories
/admin/orders · /[id]     (status, tracking, returns/exchanges, CSV export)
/admin/returns
/admin/customers · /[id]
/admin/coupons
/admin/marketing          Announcement bar, hero, story, benefits, banners, gallery, featured
/admin/newsletter         Subscribers + CSV export
/admin/pages              CMS pages
/admin/size-guides
/admin/settings           Store, shipping, payments, pre-launch, social, SEO, staff
/sitemap.xml · /robots.txt
```

## 10. Backend architecture

```
Browser ──► Next.js (App Router)
             ├─ Server Components  → read via Prisma (catalog, CMS, settings)
             ├─ Server Actions     → mutations (cart checkout, auth, admin CRUD) — Zod-validated,
             │                       role-checked, CSRF-protected by Next's origin check
             ├─ Route Handlers     → /media/* (uploaded files), CSV exports
             └─ proxy.ts           → fast cookie gate for /admin and /account
           Prisma 7 ──► PostgreSQL
           Storage adapter ──► local disk | Cloudinary
```

* **Pricing is always server-side.** The client cart only stores variant ids and
  quantities; checkout re-reads prices, stock, coupons and delivery rules inside a
  transaction and decrements stock atomically.
* **Settings & content** are typed key/value records (validated with Zod, merged with
  defaults) so nothing business-specific is hard-coded.
* **Payments** are pluggable providers. COD, bank transfer and manual JazzCash/Easypaisa
  transfers work today (the customer submits a transaction reference, admin verifies).
  Gateway APIs are scaffolded but stay disabled until merchant credentials are tested.
* **Courier** — admin records courier + tracking number per order; customers see it on
  the tracking page. API integrations (TCS, Leopards, PostEx, Trax) plug into the same field.
* **Security** — bcrypt (12 rounds), hashed session tokens, httpOnly/SameSite cookies,
  login rate limiting, role-based guards (`ADMIN`, `STAFF`, `CUSTOMER`), upload type/size
  checks, security headers, no secrets in the client bundle.

## 11. Database structure

```
User ─┬─< Session
      ├─< Address
      ├─< WishlistItem >── Product
      └─< Order
Category >──< Product ─┬─< ProductImage
                       ├─< ProductColor
                       ├─< ProductVariant (size × colour, SKU, stock, price override)
                       └── SizeGuide
Order ─┬─< OrderItem (snapshot: name, sku, size, colour, image, price)
       ├─< OrderEvent (timeline, public/internal)
       └─< ReturnRequest (return / exchange workflow)
Coupon · Subscriber (newsletter | launch | tryon) · Banner · GalleryImage
Page (CMS) · Media · Setting (typed key/value: store, shipping, payments, prelaunch,
announcement, home content, SEO)
```

Money is stored as integer rupees (PKR has no minor unit in retail use).

## 12. Development roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Research, creative direction, architecture (this document) | ✅ |
| 2 | Design system: tokens, type, components, motion presets | ✅ |
| 3 | Homepage incl. 3D bear hero and 3D wardrobe | ✅ |
| 4 | Shop, collections, search, filters, PDP, cart, checkout, wishlist, accounts, tracking | ✅ |
| 5 | Database, auth, admin (products, inventory, orders, returns, customers, coupons, marketing, CMS, settings) | ✅ |
| 6 | Testing: type-check, production build, end-to-end flows, responsive screenshots | ✅ |
| Next | Upload real products & photography · connect payment gateway credentials · courier API · transactional email (SMTP) · 3D garment assets for try-on Phase 2 | Requires business inputs |
