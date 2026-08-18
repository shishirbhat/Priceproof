# PriceProof

A price integrity and digital shelf monitoring platform. It builds a
continuous time-series record of prices and stock across retailers, then
turns that history into competitive, operational, and compliance
intelligence — detecting fake "was" prices under the EU Omnibus Directive,
stockouts, MAP violations, and price gaps across stores.

Built for the "Into the Scrape-Verse" hackathon (WeMakeDevs × Bright Data),
Aug 17–23 2026.

## Hard requirement

All scraping goes through **Bright Data Scraper Studio** — no Playwright,
Puppeteer, or raw HTTP scraping. The collector handles proxies,
geo-targeting, CAPTCHA, JS rendering, and self-healing; this repo only talks
to two REST endpoints (`dca/trigger`, `dca/dataset`). See
[`samples/README.md`](samples/README.md) for confirmed field notes on the
target storefront, including known selector gaps and scraper-honeypot
patterns.

## Repo layout

```
db/schema.sql               Postgres schema (Supabase). Append-only snapshots table.
backend/src/worker/          Bright Data trigger/poll client, ingestion worker, drift detection
backend/src/db/               migration runner, seed script (planted demo history)
backend/src/api/               HTTP API for the frontend
frontend/                       React + Tailwind dashboard + landing page
.github/workflows/               scheduled scrape + self-healing CI (see below)
samples/                          real collector output + field provenance notes
```

## Data model

Catalog-driven: `stores` and `products` are rows, not URLs baked into
scraper config. `store_products` links a product to a specific store +
region. `snapshots` is append-only and is the single source of truth —
every feature is a query over it, nothing is ever updated in place.
`is_seeded` marks generated demo history; the UI must always label it as
such, never present it as real scraped data. See `db/schema.sql` for the
full schema and the sketch of derived views (price integrity, stockouts,
competitive matrix, MAP violations).

## Setup

```
cd backend
cp .env.example .env   # fill in DATABASE_URL (Supabase) and BRIGHT_DATA_API_TOKEN
npm install
npm run migrate         # applies db/schema.sql (idempotent, safe to re-run)
npm run seed             # generates ~60 days of demo history with planted violations
npm run dev               # starts the API on :3001
npm run collect           # one real Bright Data trigger/poll/ingest cycle

cd ../frontend
npm install
npm run dev   # starts the UI on :5173, proxies /api to :3001
```

## Self-healing scraper cron

`.github/workflows/scrape-cron.yml` runs the real collection every 6 hours
via GitHub Actions, independent of anyone's laptop being on. On every run it
also compares field coverage against the previous run (`npm run
detect-drift`) — if a field that was reliably present has mostly or
entirely vanished, the target site's shape has likely changed under the
scraper.

When that happens, a second job hands the drift report and the current
field-mapping code (`backend/src/worker/ingest.ts`) to
[`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action)
running non-interactively in CI. It reads the new raw JSON shape, patches
the mapping if the change is identifiable, and commits directly — no PR,
no human in the loop, by design for this hackathon. A third job then
re-runs the full collection against the healed code and re-checks drift;
if the fix didn't actually work, that job fails loudly rather than
reporting a false green. The Actions tab is the evidence: a run history of
real scrapes, and — if the target ever changes — a visible detect → heal →
re-verify cycle instead of a silent break.

Requires three repo secrets (Settings → Secrets and variables → Actions):
`DATABASE_URL`, `BRIGHT_DATA_API_TOKEN` (same values as `backend/.env`),
and `ANTHROPIC_API_KEY` (only needed for the heal job; the cron still runs
and reports drift without it, it just can't self-fix).

## Build order

1. [x] Schema + migrations + seed script with planted violations
2. [x] Bright Data client (trigger/poll/store) + ingestion worker
3. [x] Command Center + Product Detail
4. [x] Price Integrity (hero feature)
5. [x] Scraper Health
6. [x] Competitive Landscape + Availability
7. [x] MAP + Alerts
8. [ ] Polish, empty states, demo script — empty/loading/error states are done (see `QueryState`); demo script and final visual pass remain

If time runs short, cut from the bottom — never cut 4 or 5.

## Verified end-to-end (2026-08-18)

All 9 pages checked with Playwright against the live seeded database and
API — real data renders correctly, zero browser console errors, and both
write paths (alert creation, manual collection trigger) work. Two real
bugs were caught this way (not by typecheck) and fixed: a price-integrity
window function that included the sale's own discounted days in its
30-day lookback, and a restock-duration calculation that only measured
the gap to the previous snapshot instead of the full stockout streak. See
commit history for details.

**Known gaps, honestly:**
- Only one store (`Alto & Oak`) is connected — Competitive Landscape's
  cross-store spread has nothing to compare against yet. The UI says so
  explicitly rather than hiding it.
- No live Bright Data collection has run yet (needs
  `BRIGHT_DATA_API_TOKEN`) — Scraper Health is correctly empty, not
  broken.
- Alert rules evaluate immediately on creation and again after every
  ingest (seed or live collection) — `price_below`/`map_breach` fire on
  every snapshot the condition holds (an honest append-only record, not
  just the first breach), `back_in_stock` fires on the restock edge.
  There's no standing scheduler independent of ingest — a rule only
  re-checks when new data arrives, which is correct for this app (nothing
  changes between scrapes) but worth knowing.
