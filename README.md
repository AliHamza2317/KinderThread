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
| **Storefront** | Floating glass pill header with an **age-first menu** (Newborn · Baby · Toddler · Girls · Boys) and mega menu, search overlay (⌘K) · **full-width hero slider** (colour field per slide, big headline, CTA, the full product or photo shown as a background-removed cut-out on the colour field or as a full-bleed photo, product card; arrows, progress, pause, swipe) · shop-by-age chips · trust strip (COD, free delivery threshold, exchanges, help) · New Arrivals swipe row · expanding category photo panels · shop-by-age bento · editorial brand story · best sellers · “Why Kinder Thread” with a pinned, changing photo · newsletter · compact footer · optional Eid/sale campaign banner with countdown, photo banners and gallery |
| **Motion** | Light and CSS-first: hero entrance and scroll reveals are pure CSS (content is never hidden waiting for JavaScript), Motion for menus/drawers, magnetic CTAs, desktop-only Lenis smooth scroll — all respect “reduce motion”. No WebGL, preloader or custom cursor (research in Nov 2026: none of the kidswear brand sites checked use them, and they slowed this site down) |
| **Shopping** | Shop / collections / search with filters (age, gender, size, colour, price, availability, sale) and sorting · product page with gallery, zoom, swipe, colour & size selection, stock, size guide, related & recently viewed · quick add · wishlist · cart drawer and page · checkout with coupons and delivery fees (demo confirmation) · order tracking |
| **Account** (`/account`) | Sign-in / register screens and a demo account with orders, order detail, return/exchange request, addresses and profile |
| **Admin** (`/admin`) | Dashboard, products, categories, inventory, size guides, orders, returns, customers, coupons, homepage & marketing, subscribers, pages, settings, staff — all on dummy data |
| **SEO & performance** | Metadata, Open Graph image, JSON-LD, sitemap.xml, robots.txt · optimised WebP/AVIF images · only the logo and hero photo are preloaded · ~245 KB JS on the homepage |

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
| Photos | `public/images/` (credits in `public/images/CREDITS.md`) |
| Homepage slider and Shop page banner slides (4 + 3 slots), campaign/Eid banner (off by default), section on/off | `home` in `src/lib/settings.ts` (also editable in Admin → Homepage & marketing) |

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
