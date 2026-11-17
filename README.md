# Kinder Thread — online store

A complete e-commerce platform for **Kinder Thread**, a kids clothing brand for ages 0–5 in Pakistan:
a premium, photography-led storefront, shopping cart and checkout, customer accounts, and a full admin dashboard.

> The research, creative direction, design system, architecture and roadmap are in **[docs/PLAN.md](docs/PLAN.md)**.

## What's inside

| Area | Highlights |
|------|-----------|
| **Storefront** | Announcement bar · sticky header with mega menus, search overlay (⌘K), animated bag · editorial photographic hero (editable in admin) · service strip · featured categories · new arrivals rail · brand story · shop by age · best sellers · photographic promo banners · “Why Kinder Thread” · gallery · newsletter |
| **Shopping** | Shop / collections / search with filters (age, gender, size, colour, price, availability, sale) and sorting · product page with gallery, zoom, swipe, colour & size selection, live stock, size guide, WhatsApp inquiry, related & recently viewed · quick add · wishlist · cart drawer and page · checkout with coupons, delivery fees and configurable payment methods · order confirmation · public order tracking |
| **Accounts** | Register / sign in · order history & detail · return / exchange requests · saved addresses · profile & password · sign out of all devices |
| **Admin** (`/admin`) | Dashboard · products with images, colours, size × colour variants, SKUs, stock and discounts · categories · inventory · size guides · orders (status flow, payment verification, courier & tracking, cancel with restock, packing slip, CSV export) · returns & exchanges · customers & segments · coupons · homepage & marketing content · banners & gallery · subscribers (CSV) · CMS pages · settings · staff & roles |
| **Pre-launch mode** | One switch in Admin → Settings shows a Coming Soon page with launch notifications; staff can still preview the full store |
| **SEO & performance** | Metadata, Open Graph image, Product/Organization JSON-LD, sitemap.xml, robots.txt · optimised WebP/AVIF images via `next/image` · subtle GSAP/Motion animation that respects reduced-motion settings |

## Sample content — please read

Real stock hasn't arrived yet, so the database is seeded with **14 sample products** and placeholder
photography from [Unsplash](https://unsplash.com) (free for commercial use under the Unsplash License — the
full list is in [`public/images/CREDITS.md`](public/images/CREDITS.md)). These photos are **not** pictures of
Kinder Thread products: every sample product shows a small “Sample” note on its card and a “Sample listing”
notice on its product page. The photos were chosen to avoid identifiable children's faces and other brands'
logos.

When your inventory arrives:
1. Upload real products and photos in **Admin → Products** (or edit the samples).
2. Click **Remove all samples** in Admin → Products.
3. Replace the hero, story images, banners and gallery in **Admin → Homepage & marketing**, and the category images in **Admin → Categories**.
4. Replace the sample measurements in **Admin → Size guides** with your supplier's size chart.
5. Review the policy pages (shipping, returns, privacy, terms) in **Admin → Pages**.

If you seeded the database with an earlier version of this project, replace the old sample content with:

```bash
npm run db:seed -- --refresh-samples
```

## Tech stack

Next.js 16 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL + Prisma 7 ·
GSAP + ScrollTrigger · Motion · Lenis · Zustand · Zod.

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

Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

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
