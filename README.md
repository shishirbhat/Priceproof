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
db/schema.sql          Postgres schema (Supabase). Append-only snapshots table.
backend/src/worker/     Bright Data trigger/poll client + ingestion worker
backend/src/db/         migration runner, seed script (planted demo history)
backend/src/api/        HTTP API for the frontend (not yet built)
frontend/               React + Tailwind UI (not yet built)
samples/                real collector output + field provenance notes
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
npm run collect           # one real Bright Data trigger/poll/ingest cycle
```

## Build order

1. [x] Schema + migrations + seed script with planted violations
2. [x] Bright Data client (trigger/poll/store) + ingestion worker
3. [ ] Command Center + Product Detail
4. [ ] Price Integrity (hero feature)
5. [ ] Scraper Health
6. [ ] Competitive Landscape + Availability
7. [ ] MAP + Alerts
8. [ ] Polish, empty states, demo script

If time runs short, cut from the bottom — never cut 4 or 5.
