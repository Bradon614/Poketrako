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
| Frontend | React 19, Vite 7, React Router 7, Chart.js via `react-chartjs-2` |
| Styling  | Plain CSS |

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

> **Note:** there are no seeded categories yet, and `Expense.categoryId` is
> required, so expenses cannot be created until categories exist. This is a known
> schema issue scheduled for a later phase.

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

Other frontend commands:

```bash
npm run build     # production build
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

## API

| Method | Endpoint            | Auth | Status |
|--------|---------------------|------|--------|
| `GET`  | `/health`           | no   | Working |
| `POST` | `/api/auth/signup`  | no   | Working |
| `POST` | `/api/auth/login`   | no   | Working — returns a JWT valid for 24h |
| `GET`  | `/api/auth/me`      | yes  | Working |
| `GET`  | `/api/expenses`     | no   | Placeholder — returns static text |

Authenticated requests use `Authorization: Bearer <token>`.

## Current status

**Working**

- User registration, login and "current user" endpoints
- Prisma schema and migrations
- Frontend builds and lints cleanly

**Not working yet**

- Expense, income, category and summary endpoints are written as controllers but
  are not mounted on any route
- The dashboard, expense table, income table and category screens render, but the
  API calls behind them return 404 until those routes exist
- The signup page form is not wired to the API
- There is no route protection: `/dashboard` is reachable without a token
- Receipt upload middleware exists but is not connected to any route
- There are no automated tests

**Known limitations**

- No input validation on the API
- No rate limiting or security headers
- CORS is open to all origins
- Categories are global rather than per-user

## Roadmap

1. ~~Phase 1 — Make the project run again~~ (done)
2. Phase 2 — Backend stabilization: mount the missing routes, central error handling
3. Phase 3 — Database corrections: per-user categories, money precision, seeds
4. Phase 4 — Authentication and security hardening
5. Phase 5 — Frontend foundation: real API client, auth guard, working forms
6. Phase 6 — UI/UX redesign
7. Phase 7 — Remaining features
8. Phase 8 — Testing
9. Phase 9 — Deployment
10. Phase 10 — Mobile application (React Native / Expo)

## License

ISC
