# Kinder Thread — online store (frontend)

A premium, photography-led storefront for **Kinder Thread**, a kids clothing brand for ages 0–5 in Pakistan,
plus the customer account area and admin dashboard screens.

> **Runs on sample data for now.** Products, categories, orders, customers and settings come from dummy data in
> [`src/data/`](src/data). Forms validate input but nothing is saved — checkout shows a demo confirmation, and the
> admin/account pages show sample content. The real API (Express + MongoDB) lives in [`../backend`](../backend);
> see "Connecting the backend" below for where the two meet.

This folder is the Next.js app of the [Kinder Thread monorepo](../README.md). The research, creative direction
and design system are in **[docs/PLAN.md](../docs/PLAN.md)**.

## What's inside

| Area | Highlights |
|------|-----------|
| **Storefront** | Floating glass pill header with an **age-first menu** (Newborn · Baby · Toddler · Girls · Boys) and mega menu, search overlay (⌘K) · homepage laid out like Pakistani kidswear stores (Baby Planet, Minnie Minors, Bachaa Party): **full-width photo banner slider** (headline, “Shop now”, dots, arrows, pause, swipe) · shop by age as round photos · shop by category photo tiles · New Arrivals with All / Girls / Boys / Newborn tabs and “View all” · two promo banners · best sellers · full-width brand banner · trust strip (COD, free delivery threshold, exchanges, help) · newsletter · app-style bottom bar on phones (Shop, Wishlist, Bag, Account, Search) · compact footer · optional Eid/sale campaign banner with countdown and gallery |
| **Motion** | Light and CSS-first: hero entrance and scroll reveals are pure CSS (content is never hidden waiting for JavaScript), Motion for menus/drawers, magnetic CTAs, desktop-only Lenis smooth scroll — all respect “reduce motion”. No WebGL, preloader or custom cursor (research in Nov 2026: none of the kidswear brand sites checked use them, and they slowed this site down) |
| **Shopping** | Shop / collections / search with filters (age, gender, size, colour, price, availability, sale) and sorting · product page with gallery, zoom, swipe, colour & size selection, stock, size guide, related & recently viewed · quick add · wishlist · cart drawer and page · checkout with coupons and delivery fees (demo confirmation) · order tracking |
| **Inner pages** | Same look as the homepage: Shop opens with a full-width photo banner slider, collection pages with an editorial header (a soft colour per collection, large title, facts — styles, cash on delivery — a “Shop the collection” button and a photo collage of the collection photo plus two of its products with name and price; on phones the full-width photo banner with the title over it), then round photo links to every collection, a toolbar with Filter & sort · count · age filters · sort, and the grid · Collections page with photo banners and category tiles · other pages (cart, wishlist, search, size guide, help pages) use a flat full-width title band · app-style bottom bar on phones on every page except product pages (own Add to bag bar) and checkout |
| **Account** (`/account`) | Sign-in / register screens and a demo account with orders, order detail, return/exchange request, addresses and profile |
| **Admin** (`/admin`) | Dashboard, products, categories, inventory, size guides, orders, returns, customers, coupons, homepage & marketing, subscribers, pages, settings, staff — all on dummy data · clean app-style look: white sidebar and cards on a light neutral page, crisp white form controls with clear dropdown arrows, no number spinners, calmer buttons, a sign-in screen |
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
| Homepage banner slides (4 photo slots), shop-by-age photos, brand banner, Shop page slides (3 slots), campaign/Eid banner (off by default), section on/off — the two promo banners come from Admin → Promo banners | `home` in `src/lib/settings.ts` (also editable in Admin → Homepage & marketing) |

Sample products show a small “Sample” note. The photos are free Unsplash placeholders, not pictures of
Kinder Thread products — replace them with your own photography before launch.

## Connecting the backend

The API in [`../backend`](../backend) already implements everything these screens need (catalogue, cart pricing,
checkout, tracking, accounts, admin) — see its README for the endpoint list. Data access in this app goes
through a few modules, so the UI doesn't need to change when it switches from sample data to the API:

| Here (sample data today) | Backend endpoint(s) |
|---|---|
| `src/lib/catalog.ts` — `listProducts`, `getProductBySlug`, facets, categories | `GET /api/products`, `/api/products/:slug`, `/api/products/facets`, `/api/categories` |
| `src/lib/pricing.ts` — `quoteCart` | `POST /api/cart/quote` |
| `src/components/checkout/checkout-form.tsx` + `src/stores/demo-orders.ts` — demo order | `POST /api/orders`, `GET /api/orders/track` |
| `src/lib/settings.ts`, `src/lib/cms.ts` — settings, pages, banners | `GET /api/settings`, `/api/pages`, `/api/banners`, `/api/gallery` |
| `src/lib/auth.ts` + `src/actions/account.ts` — demo customer | `POST /api/auth/login`, `/api/auth/register`, `/api/account/*` |
| `src/actions/admin/*` — admin forms (demo message) | `/api/admin/*` (staff sign-in) |

Record types are in `src/lib/types.ts`; the API returns the same field names (with `id` for every document).

## Deployment (Vercel)

Import the repository into Vercel as a new project and set **Root Directory** to `frontend` — Vercel detects
Next.js and needs no other settings. The backend is a second Vercel project from the same repository (Root
Directory `backend`); see the [main README](../README.md).
