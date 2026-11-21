# Kinder Thread

Online store for **Kinder Thread**, a kids clothing brand for ages 0–5 in Pakistan.
The repository holds two projects:

| Folder | What | Tech |
|--------|------|------|
| [`frontend/`](frontend) | the website: storefront, customer account and admin panel | Next.js 16, React 19, Tailwind CSS 4 |
| [`backend/`](backend) | the REST API and database | Node.js, Express 5, MongoDB (Mongoose), TypeScript |

Each folder is a self-contained project with its own `package.json`, README and Vercel project.
The research, creative direction and design system are in [`docs/PLAN.md`](docs/PLAN.md).

> **Status:** the frontend still runs on built-in sample data; the backend is complete and tested and is the
> next thing to connect (the mapping is in [frontend/README.md](frontend/README.md#connecting-the-backend)).

## Run both locally

Requirements: **Node.js 22.9+** and a MongoDB database with transactions — a free MongoDB Atlas cluster is ideal (a local MongoDB must run as a replica set).

Backend — set up `.env` first (see [backend/README.md](backend/README.md)):

```bash
cd backend && npm install && cp .env.example .env
```

```bash
npm run seed && npm run dev
```

Frontend, in a second terminal:

```bash
cd frontend && npm install && npm run dev
```

The website runs on http://localhost:3000 and the API on http://localhost:4000 (e.g. http://localhost:4000/api/health).

## Deploy on Vercel

Create **two Vercel projects from this one repository** (*Add New → Project → Import*), changing only the
**Root Directory**:

| Vercel project | Root Directory | Detected as | Environment variables |
|----------------|----------------|-------------|------------------------|
| website | `frontend` | Next.js | none needed yet |
| API | `backend` | Express (`src/app.ts`) | `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS` (+ optional `BLOB_READ_WRITE_TOKEN`) |

Every push then deploys both. Step-by-step instructions for MongoDB Atlas, the backend environment variables and
loading the starter data are in [backend/README.md](backend/README.md#deploying-to-vercel).

## Tests

```bash
cd backend && npm test
```

```bash
cd frontend && npm run typecheck && npm run build
```
