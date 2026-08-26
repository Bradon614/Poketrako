# POKETRAKO

POKETRAKO is a personal finance web application for tracking income and expenses.
It started as a first-year university project and is currently being revived and
completed incrementally.

> **Project status: early / in progress.**
> Only user registration and login work end to end today. The dashboard, expense,
> income and category screens exist in the codebase but are not yet connected to a
> working API. See [Current status](#current-status) for the exact state of things.

## Architecture

```
Browser (React SPA)  ──HTTP/JSON──>  Express API  ──Prisma──>  PostgreSQL
```

A future mobile application is planned and will consume the same Express API.
The database is never accessed directly by any client.

```
Poketrako/
├── Backend/            Express 5 REST API (CommonJS)
│   ├── controllers/    Request handlers
│   ├── middleware/     JWT auth, file upload
│   ├── routes/         Express routers
│   ├── prisma/         Schema and SQL migrations
│   └── server.js       Application entry point
└── frontend/           React 19 single-page app built with Vite
    └── src/
        ├── api.js      HTTP client for the backend
        ├── components/ UI components
        ├── pages/      Routed pages
        └── styles/     Plain CSS
```

## Technologies

| Area     | Technology |
|----------|------------|
| Backend  | Node.js, Express 5, Prisma 6, PostgreSQL |
| Auth     | JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing |
| Security | `helmet` (HTTP security headers), `express-rate-limit` (auth brute-force protection), origin-restricted CORS |
| Frontend | React 19, Vite 7, React Router 7, Chart.js via `react-chartjs-2` |
| Styling  | Plain CSS, dark futuristic design system (`src/styles/theme.css`) — near-black surfaces, violet/indigo gradient accents, glow shadows, motion |

## Prerequisites

- Node.js 18 or newer
- npm
- A running PostgreSQL server (14 or newer)

## Installation

```bash
git clone https://github.com/Bradon614/Poketrako.git
cd Poketrako
```

Install both projects:

```bash
cd Backend && npm install
cd ../frontend && npm install
```

## Environment variables

Both projects ship a `.env.example`. Copy each one to `.env` and fill it in.
Real `.env` files are ignored by Git and must never be committed.

```bash
cp Backend/.env.example Backend/.env
cp frontend/.env.example frontend/.env
```

### `Backend/.env`

| Variable       | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | yes      | PostgreSQL connection string used by Prisma |
| `JWT_SECRET`   | yes      | Secret used to sign JWTs. Generate with `openssl rand -base64 32` |
| `PORT`         | no       | API port. Defaults to `5000` |
| `FRONTEND_URL` | no       | Origin allowed by CORS. Defaults to `http://localhost:5173` |

The server refuses to start if `DATABASE_URL` or `JWT_SECRET` is missing.

### `frontend/.env`

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `VITE_API_URL`  | no       | API base URL. Defaults to `http://localhost:5000/api` |

## Database setup

Create the database, then apply the existing migrations:

```bash
createdb poketrako
cd Backend
npx prisma migrate deploy
npx prisma generate
```

The schema defines `User`, `Category`, `Expense`, `Income` and `ReceiptUpload`.
Categories belong to a single user (`Category.userId`, unique per user+name),
and `Expense.categoryId` is optional so an expense can exist before it is
categorized.

> **Note:** there is no seed data yet — a new user starts with zero categories.
> Deleting a `User` now cascades at the database level to their categories,
> expenses, incomes and receipt uploads.

## Running the project

Backend (port 5000 by default):

```bash
cd Backend
npm start
```

Frontend (port 5173 by default):

```bash
cd frontend
npm run dev
```

> **macOS note:** port 5000 is often occupied by the system AirPlay Receiver
> (`ControlCenter`), which silently answers with `403 Forbidden` instead of a
> connection error — Express fails to bind and exits. If `Backend/npm start`
> doesn't print "Server listening on port 5000", either disable AirPlay
> Receiver (System Settings → General → AirDrop & Handoff) or set a different
> `PORT` in `Backend/.env` and matching `VITE_API_URL` in `frontend/.env`.

Other frontend commands:

```bash
npm run build     # production build
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

## Testing

Backend tests use Vitest + Supertest against a real, separate PostgreSQL
database — no mocking of Prisma. This catches real constraint/cascade
behavior that mocks would silently miss.

One-time setup:

```bash
createdb poketrako_test
cd Backend
cp .env.test.example .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/poketrako_test?schema=public" npx prisma migrate deploy
```

Run the suite:

```bash
cd Backend
npm test          # single run
npm run test:watch # watch mode
```

Each test file clears the database (and the `uploads/` folder) before every
test via `beforeEach` — tests don't depend on execution order. The suite
refuses to run if `DATABASE_URL` doesn't point at `poketrako_test`, as a
guard against accidentally wiping a real database. Auth rate limiting is
disabled when `NODE_ENV=test` (set automatically by `npm test`) so that
tests creating many users in quick succession don't trip it; the limiter
itself was verified manually (see Phase 4 in the project history).

Covered: signup/login validation, JWT auth on every protected route,
per-user data isolation, category/expense/income CRUD, recurring expense
occurrence generation (including day-of-month clamping), monthly summary
aggregation, budget-vs-income alert priority, and the full receipt
upload/replace/delete lifecycle including in the filesystem.

Not yet covered: frontend component tests, end-to-end tests.

## API

All endpoints are prefixed with `/api`. Authenticated requests use
`Authorization: Bearer <token>`.

| Method   | Endpoint              | Auth | Description |
|----------|------------------------|------|-------------|
| `GET`    | `/health`              | no   | Liveness check |
| `POST`   | `/auth/signup`         | no   | Create a user |
| `POST`   | `/auth/login`          | no   | Returns a JWT valid for 24h |
| `GET`    | `/auth/me`             | yes  | Current user (includes `budget`) |
| `PUT`    | `/auth/budget`         | yes  | Set the monthly budget |
| `PUT`    | `/auth/currency`       | yes  | Set the display currency (`MGA`, `EUR`, `USD`, `GBP`) |
| `GET`    | `/expenses`            | yes  | List expenses (`start`, `end`, `categoryId`, `type`, `_sort`, `_limit`) |
| `GET`    | `/expenses/:id`        | yes  | Get one expense |
| `POST`   | `/expenses`            | yes  | Create an expense |
| `PUT`    | `/expenses/:id`        | yes  | Update an expense |
| `DELETE` | `/expenses/:id`        | yes  | Delete an expense |
| `POST`   | `/expenses/:id/receipt`| yes  | Upload/replace a receipt (multipart, field `receipt`) |
| `DELETE` | `/expenses/:id/receipt`| yes  | Delete a receipt |
| `GET`    | `/incomes`             | yes  | List incomes |
| `GET`    | `/incomes/:id`         | yes  | Get one income |
| `POST`   | `/incomes`             | yes  | Create an income |
| `PUT`    | `/incomes/:id`         | yes  | Update an income |
| `DELETE` | `/incomes/:id`         | yes  | Delete an income |
| `GET`    | `/categories`          | yes  | List the current user's categories |
| `POST`   | `/categories`          | yes  | Create a category |
| `PUT`    | `/categories/:id`      | yes  | Update a category |
| `DELETE` | `/categories/:id`      | yes  | Delete a category (blocked if in use) |
| `GET`    | `/summary/monthly`     | yes  | Income/expenses/balance/budget for a given month |
| `GET`    | `/summary`             | yes  | Income/expenses/balance for a date range (`start`, `end`) |
| `GET`    | `/summary/alerts`      | yes  | Whether expenses exceed income this month |

Every resource is scoped to the authenticated user — a JWT can only read or
modify its own data.

All error responses use the same envelope: `{ "message": "..." }` with an
appropriate status code (`400` validation, `401` auth, `404` not found, `500`
unexpected). Raw Prisma error details are logged server-side but never sent to
the client. Unmatched routes return `404 { "message": "Route non trouvée" }`,
and truly unexpected server errors return `500` via the centralized handler in
`server.js`.

Request bodies are validated by hand (see `Backend/utils/validation.js`) —
amounts must be positive numbers, dates must parse, `Category`/`Income` names
and sources must be non-empty, emails must look like emails, and passwords
must be at least 8 characters.

### API security

- `helmet` sets standard HTTP security headers (CSP, `X-Frame-Options`, etc.)
- CORS only accepts requests from `FRONTEND_URL`
- `/api/auth/login` is limited to 10 requests / 15 min per IP, `/api/auth/signup`
  to 20 / 15 min — both return `429 { "message": "..." }` once exceeded

## Current status

**Working**

- User registration, login and "current user" endpoints, fully wired end to end
- Full CRUD on expenses, incomes and categories, from the UI down to the database
- Monthly summary cards, cash flow chart and budget alert on the dashboard
- Protected routes redirect to login when there's no token
- Consistent dark UI across every page, sharing one set of design tokens
- Responsive layout (desktop/tablet/mobile) verified in the browser
- Empty, loading and error states on every data-driven view
- Full expense and income creation forms, reachable from their respective pages
- Monthly budget: set from the dashboard, shown as a progress bar, and used by
  the budget alert (falls back to the income comparison when no budget is set)
- Recurring expenses: creating one with a start date (and optional end date)
  generates one real row per month, clamped to the last valid day of shorter
  months (e.g. Jan 31 -> Feb 28/29)
- Receipt upload on one-time expenses (JPEG/PNG/GIF/PDF, 1MB max): view,
  replace or delete from the expense table
- Per-user currency preference (Ariary by default, or EUR/USD/GBP), saved in
  the database and applied everywhere an amount is shown — including
  server-generated alert messages, not just the frontend
- Custom SVG logo, dark futuristic UI with gradient/glow accents and motion
- Prisma schema and migrations
- Frontend builds and lints cleanly
- 52 backend tests (Vitest + Supertest) against a real test database

**Not working yet**

- No editing or deletion from the UI for expenses/incomes themselves
  (creation and listing only); category editing/deletion exists but with no
  confirmation step
- Recurring expenses are generated once at creation time, capped at 60
  occurrences; a series isn't linked as a group afterward, so editing/deleting
  only ever affects one occurrence at a time, not the whole series
- Receipts can only be attached to one-time expenses, not recurring ones
  (a recurring expense creates many rows at once — there's no single
  occurrence to attach a file to at creation time)
- No frontend tests (component or end-to-end) yet — only the backend has
  automated coverage, see [Testing](#testing)

**Known limitations**

- `npm audit` reports vulnerabilities in transitive dependencies of `multer`
  and `express` (`path-to-regexp`, `qs`) — tracked for a later dependency
  bump, not fixed blindly with `--force` since that can be a breaking change
- No refresh tokens: sessions expire after 24h with no renewal flow
- No account lockout beyond the IP-based rate limit (e.g. no CAPTCHA)
- Route protection is a client-side presence check only (no token
  validation before rendering) — this is a UX guard, not a security
  boundary; the API is what actually enforces access control

## Deployment

Stack: **Vercel** (frontend), **Render** (backend API), **Neon** (Postgres) —
all have a free tier that doesn't need a credit card, and none of them need a
server to maintain by hand.

### 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string Neon gives you (the plain, non-pooled one —
   this backend is a single long-lived Node process, not serverless
   functions, so Prisma's own connection pooling is enough and there's no
   need for Neon's PgBouncer pooler). It looks like
   `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`.
3. Keep it — it's the `DATABASE_URL` used in the next step.

### 2. Backend — Render

Uses the [`render.yaml`](render.yaml) Blueprint at the repo root.

1. Render dashboard → **New** → **Blueprint** → select this repo.
2. Render reads `render.yaml` and proposes a `poketrako-api` web service
   (free plan, rooted at `Backend/`). Accept it.
3. Fill in the three secrets it asks for (left blank in the Blueprint on
   purpose so they're never committed):
   - `DATABASE_URL` → the Neon connection string from step 1
   - `JWT_SECRET` → a long random value, e.g. `openssl rand -base64 32`
   - `FRONTEND_URL` → leave a placeholder for now (`http://localhost:5173`
     works), you'll update it once the Vercel URL exists (step 3)
4. Deploy. The build runs `npx prisma generate`; the start command runs
   `npx prisma migrate deploy` before `node server.js`, so the database
   schema is created/updated automatically on every deploy.
5. Once live, note the service URL, e.g. `https://poketrako-api.onrender.com`.

> **Free plan cold starts:** Render's free web services spin down after
> ~15 minutes of inactivity. The first request after a quiet period can take
> 30–60 seconds while it wakes back up — expected, not a bug.

> **Uploaded receipts are not persistent on the free plan.** Render's free
> tier has an ephemeral filesystem, so files in `Backend/uploads/` are lost
> on every redeploy or restart. Fine for a demo/student project; a real
> deployment would swap local disk storage for something like S3 — not done
> here, to avoid adding cloud-storage complexity before it's actually needed.

### 3. Frontend — Vercel

Uses [`frontend/vercel.json`](frontend/vercel.json) for SPA routing (without
it, refreshing on a route like `/dashboard` would 404 — Vercel needs to be
told to always fall back to `index.html` and let React Router take over).

1. Vercel dashboard → **Add New** → **Project** → import this repo.
2. Set **Root Directory** to `frontend` (Vercel auto-detects the Vite
   preset once you do).
3. Add one environment variable: `VITE_API_URL` →
   `https://poketrako-api.onrender.com/api` (the Render URL from step 2,
   with `/api` appended).
4. Deploy. Note the resulting URL, e.g. `https://poketrako.vercel.app`.

### 4. Close the loop — CORS

Go back to the Render service → Environment → update `FRONTEND_URL` to the
real Vercel URL from step 3 (exact match, no trailing slash), and redeploy.
CORS checks an exact origin match, so this step is what actually lets the
deployed frontend talk to the deployed API — skipping it leaves every
request blocked by the browser with a CORS error.

### What's deliberately not done

- **Custom domain / HTTPS setup beyond the platforms' defaults** — Vercel
  and Render both provision HTTPS automatically on their `*.vercel.app` /
  `*.onrender.com` subdomains, which is enough for a student project.
- **CI pipeline** (running the backend test suite before deploy) — the test
  suite exists (see [Testing](#testing)) but isn't wired into either
  platform's deploy flow yet.
- **Persistent file storage for receipts** — see the note above.

## Roadmap

1. ~~Phase 1 — Make the project run again~~ (done)
2. ~~Phase 2 — Backend stabilization: mount the missing routes, central error handling, per-user categories~~ (done)
3. ~~Phase 3 — Request validation, consistent error envelope, cascading deletes~~ (done)
4. ~~Phase 4 — Security hardening: helmet, CORS restriction, auth rate limiting~~ (done)
5. ~~Phase 5 — Frontend foundation: real API client usage everywhere, auth guard, working forms~~ (done)
6. ~~Phase 6 — UI/UX redesign: shared design tokens, responsive layout, empty/loading/error states~~ (done)
7. ~~Phase 7 — Remaining features~~ (done): income creation form, budgets,
   recurring transactions, receipt upload
8. Phase 8 — Testing: ~~backend (Vitest + Supertest, real test database)~~ (done);
   frontend component/e2e tests still to do
9. ~~Phase 9 — Deployment: Vercel + Render + Neon, see [Deployment](#deployment)~~ (done)
10. Phase 10 — Mobile application (React Native / Expo)

## License

ISC
