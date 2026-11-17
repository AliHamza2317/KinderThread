# Kinder Thread — online store

A complete e-commerce platform for **Kinder Thread**, a kids clothing brand for ages 0–5 in Pakistan:
premium storefront with 3D experiences, shopping cart and checkout, customer accounts, and a full admin dashboard.

> The research, creative direction, design system, architecture and roadmap are in **[docs/PLAN.md](docs/PLAN.md)**.

## What's inside

| Area | Highlights |
|------|-----------|
| **Storefront** | Announcement bar · sticky header with mega menus, search overlay (⌘K), animated bag · **3D “Peek-a-boo Bear” hero** · featured categories · new arrivals rail · brand story with scroll-drawn golden thread · **interactive 3D wardrobe** · best sellers · promo banners · benefits · Instagram gallery · newsletter |
| **Shopping** | Shop / collections / search with filters (age, gender, size, colour, price, availability, sale) and sorting · product page with gallery, zoom, swipe, colour & size selection, live stock, size guide, WhatsApp inquiry, related & recently viewed · quick add · wishlist · cart drawer and page · checkout with coupons, delivery fees and configurable payment methods · order confirmation · public order tracking |
| **Accounts** | Register / sign in · order history & detail · return / exchange requests · saved addresses · profile & password · sign out of all devices |
| **Admin** (`/admin`) | Dashboard · products with images, colours, size × colour variants, SKUs, stock and discounts · categories · inventory · size guides · orders (status flow, payment verification, courier & tracking, cancel with restock, packing slip, CSV export) · returns & exchanges · customers & segments · coupons · homepage & marketing content · banners & gallery · subscribers (CSV) · CMS pages · settings · staff & roles |
| **Pre-launch mode** | One switch in Admin → Settings shows a Coming Soon page with launch notifications; staff can still preview the full store |
| **SEO & performance** | Metadata, Open Graph image, Product/Organization JSON-LD, sitemap.xml, robots.txt · 3D is lazy-loaded after first paint, paused off-screen, simplified on mid-range phones and replaced by a static image on low-power devices or with reduced motion |

## Sample content — please read

Real stock hasn't arrived yet, so the database is seeded with **16 clearly-labelled sample products** and
**illustrated sample imagery** (every image carries a visible “SAMPLE” tag and every sample product shows a
“Sample listing” notice). Nothing is presented as an actual Kinder Thread product.

When your inventory arrives:
1. Upload real products and photos in **Admin → Products** (or edit the samples).
2. Click **Remove all samples** in Admin → Products.
3. Replace the homepage story images, banners and gallery in **Admin → Homepage & marketing** and untick “sample imagery”.
4. Replace the sample measurements in **Admin → Size guides** with your supplier's size chart.
5. Review the policy pages (shipping, returns, privacy, terms) in **Admin → Pages**.

## Tech stack

Next.js 16 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL + Prisma 7 ·
three.js + React Three Fiber + Drei · GSAP + ScrollTrigger · Motion · Lenis · Zustand · Zod.

## Running locally

Requirements: **Node.js 20.9+** and **PostgreSQL 14+**.

```bash
npm install
```

```bash
cp .env.example .env   # then fill in DATABASE_URL, SITE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Open http://localhost:3000 for the store and http://localhost:3000/admin for the dashboard
(sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`). If you seed without those variables, the admin is
`admin@kinderthread.local` with password `ChangeMe-KT-2026!` — change it immediately in Admin → Settings.

Other scripts: `npm run build`, `npm start`, `npm run typecheck`, `npm run samples` (regenerates the sample illustrations).

## Configuration checklist before launch

Everything below is set in **Admin → Settings** (no code changes needed):

- **Store details** — phone, WhatsApp, email, address, hours (empty fields are simply hidden on the site).
- **Social links** — Instagram, Facebook, TikTok (icons appear only when a link is set).
- **Delivery** — flat rate, free-delivery threshold, delivery estimate.
- **Payments** — Cash on Delivery works out of the box. Bank transfer, JazzCash and Easypaisa work as
  *manual* transfers: the customer pays to the account you enter and submits the transaction ID; you verify
  it on the order page. **Online card/wallet gateway payments are not connected** — they need a merchant
  account, API credentials and testing before they can be switched on.
- **Pre-launch mode** — turn on to show the Coming Soon page to visitors.

## Deployment notes

- Any Node host works (VPS, Railway, Render, Fly.io, Vercel). Use a managed Postgres (Neon, Supabase, RDS…).
- Run `npx prisma migrate deploy` on each deploy, then `npm run build` and `npm start`.
- On **serverless** hosts (e.g. Vercel) the local disk is not persistent — set `CLOUDINARY_URL` so uploaded images are stored on Cloudinary.
- Set a strong `AUTH_SECRET` and serve the site over HTTPS (session cookies are `Secure` in production).
- Login, checkout and newsletter rate limiting is in-memory; if you run several server instances, move it to Redis.

## Not included yet (needs business input)

- Payment gateway integration (JazzCash / Easypaisa / card APIs) — requires merchant credentials.
- Courier API integration (TCS, Leopards, PostEx, Trax) — tracking numbers are entered manually today.
- Transactional emails/SMS (order confirmation) — requires an email/SMS provider.
- Virtual try-on — evaluated in docs/PLAN.md §7; the product page has an honest “coming later” entry with a notify-me list.
