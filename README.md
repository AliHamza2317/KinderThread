# Kinder Thread — online store (frontend)

A premium, photography-led storefront for **Kinder Thread**, a kids clothing brand for ages 0–5 in Pakistan,
plus the customer account area and admin dashboard screens.

> **Frontend-only build.** There is no database yet: products, categories, orders, customers and settings
> come from dummy data in [`src/data/`](src/data). Forms validate input but nothing is saved — checkout shows a
> demo confirmation, and the admin/account pages show sample content. The data layer is isolated so a
> MongoDB backend can be connected later (see "Connecting a backend").

The research, creative direction and design system are in **[docs/PLAN.md](docs/PLAN.md)**.

## What's inside

| Area | Highlights |
|------|-----------|
| **Storefront** | Floating glass pill header with mega menus, search overlay (⌘K) · **3D hero** (photos floating in depth, Three.js) · scroll-velocity marquee · scroll-read statement · category index with cursor-following photo · pinned horizontal New Arrivals · full-screen story reveal · **3D collections ring** · shop-by-age bento · best sellers · banners · stacking “Why Kinder Thread” cards · parallax gallery · newsletter · giant wordmark footer |
| **Motion** | First-visit preloader, custom cursor, magnetic buttons, page transitions, Lenis smooth scroll, GSAP ScrollTrigger and Motion — all respect “reduce motion”; 3D falls back to still images on low-power devices |
| **Shopping** | Shop / collections / search with filters (age, gender, size, colour, price, availability, sale) and sorting · product page with gallery, zoom, swipe, colour & size selection, stock, size guide, related & recently viewed · quick add · wishlist · cart drawer and page · checkout with coupons and delivery fees (demo confirmation) · order tracking |
| **Account** (`/account`) | Sign-in / register screens and a demo account with orders, order detail, return/exchange request, addresses and profile |
| **Admin** (`/admin`) | Dashboard, products, categories, inventory, size guides, orders, returns, customers, coupons, homepage & marketing, subscribers, pages, settings, staff — all on dummy data |
| **SEO & performance** | Metadata, Open Graph image, JSON-LD, sitemap.xml, robots.txt · optimised WebP/AVIF images · 3D code loads lazily and pauses off-screen |

## Running locally

Requirements: **Node.js 20.9+**. No database or environment variables are needed.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000 for the store, http://localhost:3000/admin for the dashboard and
http://localhost:3000/account for the demo account.

Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

## Editing the dummy content

| What | Where |
|------|-------|
| Products, categories, size guide | `src/data/catalog.ts` |
| Banners, gallery, policy pages (shipping, returns, FAQ…) | `src/data/content.ts` |
| Orders, customers, coupons, subscribers, staff (admin/account demo) | `src/data/admin.ts` |
| Store details, delivery fees, payment methods, homepage text, pre-launch mode | defaults in `src/lib/settings.ts` |
| Photos | `public/images/` (credits in `public/images/CREDITS.md`); smaller copies used as 3D textures are in `public/images/hero/` and `public/images/ring/` |
| 3D scenes | `src/components/three/` — add `?kt3d=full`, `lite` or `static` to any URL to preview each device tier |

Sample products show a small “Sample” note. The photos are free Unsplash placeholders, not pictures of
Kinder Thread products — replace them with your own photography before launch.

## Connecting a backend (MongoDB) later

All data access goes through a few modules, so the UI doesn't need to change:

- `src/lib/catalog.ts` — product & category queries (`listProducts`, `getProductBySlug`, …)
- `src/lib/pricing.ts` — cart pricing, coupons, delivery fees
- `src/lib/settings.ts` — store settings
- `src/lib/auth.ts` — currently returns a demo customer/admin; replace with real sessions
- `src/actions/*` — form handlers; they validate and currently return a demo message (`src/lib/demo.ts`)
- `src/stores/demo-orders.ts` + `src/components/checkout/checkout-form.tsx` — checkout currently stores a demo
  order in the browser; replace with an API call that creates the order
- Types for every record are in `src/lib/types.ts`

## Deployment

Deploy like any Next.js app (Vercel, Netlify, any Node host): `npm run build` then `npm start`.
