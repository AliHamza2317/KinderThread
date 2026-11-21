# Kinder Thread — backend (REST API)

The API behind the Kinder Thread store: catalogue, cart pricing, checkout, order tracking, customer
accounts and everything the admin panel needs.

**Stack:** Node.js 22 · Express 5 · MongoDB with Mongoose 9 · TypeScript · zod (validation) ·
JWT + bcrypt (sign-in) · Vitest + Supertest (tests). Deploys to **Vercel** with zero configuration.

---

## Folder structure

```
backend/
├── src/
│   ├── app.ts                ← the Express app (Vercel's entry point — default export)
│   ├── local-server.ts       ← `npm run dev`: starts the app on a port
│   ├── routes.ts             ← map of every endpoint (start reading here)
│   ├── config/env.ts         ← environment variables, checked at start-up
│   ├── db/                   ← MongoDB connection (cached for serverless) + shared schema options
│   ├── lib/                  ← small helpers: errors, validation, fields, pagination, tokens, passwords
│   ├── middleware/           ← auth (requireAuth / requireStaff / requireAdmin), errors, rate limits
│   ├── modules/              ← one folder per feature (see below)
│   ├── seed/                 ← `npm run seed` + the starter data (JSON)
│   └── types/express.d.ts    ← adds `req.user` to Express' types
├── tests/                    ← integration tests against an in-memory MongoDB
├── .env.example
└── package.json
```

Every feature in `src/modules/` follows the same small set of files:

| File | Job |
|------|-----|
| `*.model.ts` | Mongoose schema — the shape of the data in MongoDB |
| `*.validation.ts` | zod schemas — what a request may contain |
| `*.service.ts` | business rules and database work (no `req`/`res` here) |
| `*.controller.ts` | reads the request, calls the service, sends the response |
| `*.routes.ts` | URL → middleware → controller |

| Module | What it covers |
|--------|----------------|
| `catalog` | categories, products, size guides, automatic collections (new arrivals, best sellers, sale) |
| `cart` | server-side pricing of a bag (`POST /api/cart/quote`) |
| `orders` | checkout, stock reservation, tracking, admin order handling |
| `coupons` | coupon rules and atomic usage counting |
| `returns` | return / exchange requests and their status flow |
| `auth` · `account` | sign-up / sign-in, profile, password, addresses, wishlist, "my orders" |
| `users` | the User model (customers and staff share one collection, told apart by `role`) |
| `customers` · `staff` | admin screens for customers and staff accounts |
| `content` | store settings, help pages, homepage banners, gallery |
| `newsletter` | sign-ups and the admin subscriber list |
| `dashboard` | numbers for the admin home screen |
| `uploads` | product photo uploads to Vercel Blob |

### How a request flows

```
request → app.ts (helmet, CORS, JSON, connect DB) → routes.ts → module routes
        → middleware (auth, rate limit) → controller → validate(zod) → service → model → JSON response
errors anywhere → middleware/error-handler.ts → { "message": "...", "errors": { field: [...] } }
```

### Conventions

- **Responses** are JSON. Documents have `id` (never `_id`/`__v`). Lists return `{ items, total, page, pages }`.
- **Errors** always look like `{ "message": "…", "errors"?: { "field": ["…"] } }` with a matching status
  (400 invalid input, 401 not signed in, 403 not allowed, 404 not found, 409 conflict, 429 too many requests).
- **Money** is whole rupees (integers). Prices, delivery and discounts are always worked out on the server —
  the API never trusts prices sent by a browser.
- **Auth** uses a Bearer token: `Authorization: Bearer <token>` from `/api/auth/login`. Tokens are checked
  against the account on every request, so deactivating a user or "sign out everywhere" takes effect immediately.
- **Express 5** passes errors from `async` handlers to the error handler automatically, so handlers simply `throw`.

---

## Running locally

Requirements: **Node.js 22.9+** and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas)
cluster works, or MongoDB installed locally).

```bash
npm install
```

```bash
cp .env.example .env
```

Fill in `.env` (see the table below), then load the starter data and create the first admin:

```bash
npm run seed
```

```bash
npm run dev
```

The API runs on http://localhost:4000 — try http://localhost:4000/api/health and
http://localhost:4000/api/products.

| Script | What it does |
|--------|--------------|
| `npm run dev` | start with auto-reload |
| `npm start` | start without reload |
| `npm run seed` | add the starter catalogue, pages, banners, coupons and the first admin (safe to re-run) |
| `npm test` | run the test suite (downloads a temporary in-memory MongoDB the first time) |
| `npm run typecheck` | TypeScript check |

### Environment variables

| Name | Required | Description |
|------|----------|-------------|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | 32+ random characters used to sign sign-in tokens |
| `JWT_EXPIRES_IN` | no | how long a sign-in lasts, default `7d` |
| `CORS_ORIGINS` | no | comma-separated sites allowed to call the API from a browser, default `http://localhost:3000` |
| `PORT` | no | local port, default `4000` (ignored on Vercel) |
| `BLOB_READ_WRITE_TOKEN` | no | Vercel Blob token — enables admin photo uploads |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | seed only | the first admin account created by `npm run seed` |

---

## API reference

Everything is under `/api`. 🔓 public · 👤 signed-in customer · 🛠 staff · 👑 admin.

### Storefront

| Method & path | | Description |
|---|---|---|
| `GET /health` | 🔓 | API and database status |
| `GET /categories` | 🔓 | visible categories with product counts |
| `GET /categories/:slug` | 🔓 | a category, or `new-arrivals` / `best-sellers` / `sale` |
| `GET /products` | 🔓 | shop grid. Query: `q, category, gender, size, age, color, min, max, inStock, sale, sort (featured·newest·price-asc·price-desc·best), page, limit` |
| `GET /products/facets` | 🔓 | filter options (colours, sizes, genders, price range) for the same query |
| `GET /products/by-ids?ids=a,b` | 🔓 | product cards for a wishlist / recently viewed |
| `GET /products/:slug` | 🔓 | product page: product, size guide, related products |
| `GET /size-guides` | 🔓 | all size charts |
| `GET /settings` | 🔓 | store settings (delivery fees, payment methods, homepage text …) |
| `GET /pages`, `GET /pages/:slug` | 🔓 | help pages (shipping, returns, FAQ …) |
| `GET /banners`, `GET /gallery` | 🔓 | homepage promo banners and gallery photos |
| `POST /cart/quote` | 🔓 | `{ lines: [{ variantId, quantity }], couponCode?, paymentMethod? }` → prices, stock issues, coupon, delivery, total |
| `POST /orders` | 🔓 / 👤 | checkout: customer details + `lines` + `paymentMethod` (+ `couponCode`, `paymentReference`). Signed-in orders appear in the account |
| `GET /orders/track?number=&phone=` | 🔓 | order tracking with the order number and checkout phone |
| `POST /newsletter` | 🔓 | `{ email, source? }` |

### Account

| Method & path | | Description |
|---|---|---|
| `POST /auth/register` | 🔓 | `{ name, email, phone?, password }` → `{ user, token }` |
| `POST /auth/login` | 🔓 | `{ email, password }` → `{ user, token }` (customers and staff) |
| `GET /auth/me` | 👤 | the signed-in user |
| `POST /auth/logout-all` | 👤 | sign out on every device |
| `PATCH /account/profile` | 👤 | `{ name, email, phone }` |
| `POST /account/password` | 👤 | `{ current, password }` → `{ token }` (other devices are signed out) |
| `GET · POST /account/addresses`, `PUT · DELETE /account/addresses/:id`, `POST /account/addresses/:id/default` | 👤 | saved addresses (one default) |
| `GET · PUT /account/wishlist`, `POST · DELETE /account/wishlist/:productId` | 👤 | wishlist kept across devices |
| `GET /account/orders`, `GET /account/orders/:number` | 👤 | my orders; the detail includes return requests and whether a return is possible |
| `POST /account/orders/:number/returns` | 👤 | `{ type: RETURN·EXCHANGE, reason, details? }` — delivered orders, within the return window |

### Admin (`/api/admin/…`)

| Method & path | | Description |
|---|---|---|
| `GET /dashboard` | 🛠 | sales (30 days), orders by status, low stock, recent orders, top products |
| `GET · POST /products`, `GET · PUT · DELETE /products/:id` | 🛠 | products with colours, images and variants (sizes, SKUs, stock) |
| `GET /products/check-slug?slug=&excludeId=` | 🛠 | is a URL slug free? |
| `PATCH /products/stock` | 🛠 | `{ updates: [{ variantId, stock }] }` inventory in bulk |
| `DELETE /products/samples` | 👑 | remove the starter sample products |
| `GET · POST /categories`, `PUT · DELETE /categories/:id` | 🛠 | categories and collections |
| `GET · POST /size-guides`, `GET · PUT · DELETE /size-guides/:id` | 🛠 | size charts (one default) |
| `GET /orders`, `GET /orders/:id` | 🛠 | orders. Query: `q, status, paymentStatus, paymentMethod, from, to, page, limit` |
| `PATCH /orders/:id/status` · `/payment` · `/shipping` · `/internal-note` | 🛠 | move the order along, payment status, courier & tracking, staff note |
| `POST /orders/:id/notes` · `/cancel` · `/mark-returned` | 🛠 | timeline note, cancel (stock goes back), mark returned |
| `GET /returns`, `PATCH /returns/:id` | 🛠 | return / exchange requests and their status |
| `GET /customers`, `GET /customers/:id`, `PATCH /customers/:id/tags` · `/active` | 🛠 | customers with order totals |
| `GET · POST /coupons`, `PUT · DELETE /coupons/:id`, `PATCH /coupons/:id/active` | 🛠 | coupons |
| `GET /subscribers`, `PATCH /subscribers/:id/active`, `DELETE /subscribers/:id` | 🛠 | newsletter list |
| `GET /settings`, `PUT /settings/:key` | 🛠 | edit one settings group (`store, shipping, payments, home, policies, seo …`) |
| `GET · POST /pages`, `PUT · DELETE /pages/:id` | 🛠 | help pages |
| `GET · POST /banners` · `/gallery`, `PUT · DELETE /banners/:id` · `/gallery/:id` | 🛠 | homepage banners and gallery |
| `GET · POST /staff`, `PATCH /staff/:id/role` · `/active`, `POST /staff/:id/reset-password` | 👑 | staff accounts (always keeps one active admin) |
| `POST /uploads?name=photo-name` | 🛠 | upload an image (body = the file, `Content-Type: image/jpeg·png·webp·avif`, ≤ 4 MB) → `{ url }` |

---

## Deploying to Vercel

The backend is its own Vercel project, created from the same repository as the frontend.

1. **Database** — create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (the free tier is fine).
   Under *Database Access* add a user; under *Network Access* allow `0.0.0.0/0` (Vercel doesn't use fixed IPs);
   copy the connection string (*Connect → Drivers*). Tip: pick an Atlas region close to your customers
   (e.g. Mumbai `ap-south-1`) and set the same area for the Vercel Functions (*Project → Settings → Functions →
   Region*, e.g. `bom1`); Vercel's default is Washington, D.C. (`iad1`).
2. **Vercel project** — *Add New → Project*, import this repository and set **Root Directory** to `backend`.
   Vercel recognises Express and uses `src/app.ts` automatically — no `vercel.json` is needed.
3. **Environment variables** — add `MONGODB_URI`, `JWT_SECRET` and `CORS_ORIGINS` (your frontend's address,
   e.g. `https://kinderthread.vercel.app`). Optional: connect a **Vercel Blob** store to the project
   (*Storage* tab) — it adds `BLOB_READ_WRITE_TOKEN` for photo uploads.
4. **Deploy**, then open `https://<backend-project>.vercel.app/api/health`.
5. **Starter data** — from your computer, put the Atlas `MONGODB_URI` and the `ADMIN_*` values in `.env` and run
   `npm run seed` once.

Vercel notes: the whole API runs as one Vercel Function; request bodies are limited to 4.5 MB (uploads are
capped at 4 MB); files can't be written to the function's disk, which is why uploads go to Vercel Blob;
`express.static` isn't used.

## Good to know

- **Stock can't be oversold:** each item is taken out of stock with a single conditional update
  (`stock >= quantity`); if one item fails, the ones already taken are put back (`orders/stock.service.ts`).
  Coupon usage limits work the same way.
- **Rate limits** (sign-in, checkout, forms) are counted in memory per server instance — enough to slow down
  bots. Use a shared store such as Redis if you need exact limits across instances.
- **Settings** are cached for 30 seconds per instance and the cache is cleared when they are saved.
- The **starter products** are samples with placeholder photos (`isSample: true`). Remove them with
  `DELETE /api/admin/products/samples` once your real products are in.
- The settings schema (`src/modules/content/settings.schema.ts`) mirrors the frontend's `src/lib/settings.ts`;
  change both together.
