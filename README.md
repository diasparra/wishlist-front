# Family wishlist

A shared wishlist for a family: everyone picks their name, keeps a list of things
they want (with links, notes, price), and can browse everyone else's lists — no
occasion, a wish is for any moment. On someone else's list you can quietly mark a
gift as **"I'll get this"** — the reservation is visible to the rest of the
family but **never to the person who wants it**, so surprises stay surprises.

Built with React + TypeScript + Vite + MUI + TanStack Query + Zod.

## Flow

1. **Family password gate** – one shared passphrase unlocks the app on a device
   (`VITE_FAMILY_PASSWORD`, remembered in `localStorage`). Client-side only; the
   self-hosted API adds an optional server-side bearer token (`API_TOKEN`). The
   read-only demo skips this step.
2. **Pick your name** – choose your family member; remembered in `localStorage`.
   "Switch person" / "Lock" from the overview reset these (no "Lock" in the demo).
3. **Overview** – a card per member linking to their list.
4. **A list** – your own list is editable (add / edit / delete) and shows no
   reservation state; another member's list shows their wishes with a
   reserve / release control.

## Data model

`db.json` holds two collections:

- `members`: `{ id, name, birthday? }` — `birthday` is `MM-DD`
- `wishes`: `{ id, memberId, title, url?, notes?, price?, priority?, createdAt, reservedBy, reservedAt }` — `reservedBy` is a member id or `null`

The owner-can't-see-reservations rule lives in one place —
`wishesFor(memberId)` in `src/providers/WishlistProvider.tsx` strips
`reservedBy` / `reservedAt` when the list belongs to the current viewer.

## API configuration & build modes

The data source is driven by Vite's mode system (`.env.<mode>` +
`import.meta.env`):

| Mode                 | Command                             | Resources                                | `VITE_READONLY` | Behavior                                                          |
| -------------------- | ----------------------------------- | ---------------------------------------- | --------------- | ----------------------------------------------------------------- |
| development          | `npm run dev` (+ `npm run backend`) | `http://localhost:3000/{members,wishes}` | `false`         | Full read/write against local json-server                         |
| production (default) | `npm run build`                     | `{members,wishes}.json` under `BASE_URL` | `true`          | Static read-only demo for GitHub Pages (no gate, banner)          |
| external             | `npm run build:external`            | `VITE_API_URL` (the `api/` backend)      | `false`         | Full read/write against the self-hosted API — see `.env.external` |

- `VITE_FAMILY_PASSWORD` – required in every mode. The read-only demo skips the
  gate entirely, so its value there is irrelevant.
- `VITE_API_TOKEN` – optional. When set, every API request carries
  `Authorization: Bearer <token>`; must match `API_TOKEN` on the backend. Leave
  empty for json-server / the demo.

Seed data (faker-based, deterministic):

- `npm run db:generate` – writes root `db.json` (json-server format)
- `npm run db:generate:pages` – writes `public/members.json` + `public/wishes.json`
  (flat arrays) for the GitHub Pages demo

CI runs `db:generate:pages` before `npm run build` so the deployed bundle ships
fresh demo data.

## Tests

- `npm run test` / `npm run coverage` – Vitest unit + component tests (co-located
  `*.test.tsx`). CI enforces 80% lines/statements/functions, 75% branches.
- `npm run e2e` – Cypress against the json-server dev stack. Boots json-server +
  the dev server via `start-server-and-test`, re-seeds `db.json` from
  `cypress/fixtures/seed.json` before each spec. Interactive: run `npm run backend`
  and `npm run dev`, then `npm run cy:open`.
- `npm run e2e:demo` – builds the read-only bundle, serves it with `vite preview`,
  and runs `cypress/demo/demo-readonly.cy.ts` (no gate, banner, no write controls).
- `cd api && npm test` – the backend's own `node:test` suite (pg-mem, no DB).

The two E2E specs that pin the core rule: `cypress/e2e/surprise-hidden.cy.ts`
(owner never sees a claim on their own list) and `cypress/e2e/reserve.cy.ts`
(claim / release / can't release someone else's claim).

## Docker

```sh
docker compose up --build
```

Front end on http://localhost:8080, json-server on http://localhost:3000. The
image is built with `npm run build:development` so the container targets the
local `backend` service rather than the read-only Pages config.

## Deploy

### 1. Read-only demo → GitHub Pages

`.github/workflows/ci.yml` builds and publishes the `production` (read-only)
bundle on every push to `main` (and via **Run workflow**). It writes
`.env.production`, runs `db:generate:pages`, `npm run build`, and deploys with
`actions/deploy-pages`. Nothing else to do — the demo skips the password gate and
shows a "read-only demo" banner.

### 2. Writable app → self-hosted API on Coolify

The backend lives in [`api/`](api/README.md): a small Fastify + Postgres service
implementing the exact endpoints `src/queries/index.ts` calls.

1. Deploy `api/` on Coolify (its README has the click-by-click: a PostgreSQL
   resource + a Dockerfile app with `DATABASE_URL`, `CORS_ORIGIN`,
   `SEED_MEMBERS`, optional `API_TOKEN`). Migrations + seed run on deploy.
2. Point this frontend at it — edit `.env.external`:
   ```
   VITE_API_URL=https://<api-domain>     # no trailing slash
   VITE_READONLY=false
   VITE_FAMILY_PASSWORD=<family passphrase>
   VITE_API_TOKEN=<matches API_TOKEN, or empty>
   ```
3. `npm run build:external` and deploy `dist/` to any static host (Netlify,
   Vercel, Coolify static, …). Set `CORS_ORIGIN` on the API to that host's origin.

The family-password check is still client-side (`SessionProvider`). `API_TOKEN`
is the server-side guard for a self-hosted instance.
