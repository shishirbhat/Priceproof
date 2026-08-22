# PriceProof — submission

**Into the Scrape-Verse** (WeMakeDevs × Bright Data), Aug 17–23 2026.

> Market-value and listings intelligence for used-car marketplaces. It turns
> a continuous, cross-portal history of listings into the three answers a
> single listing page can never give you: **is this price fair, is this the
> same car listed twice, and how long do cars like this actually take to
> sell.**

---

## The problem

A used-car listing page tells you one asking price at one moment on one
portal. It cannot tell you whether that price is fair, whether the identical
car is quietly listed 6% cheaper on a second portal, or whether the price
you're looking at has already been marked down twice because nobody's buying.
That intelligence only exists in the *history across portals* — and no portal
keeps it, because it isn't in any portal's interest to.

## What it does

PriceProof builds that history and reads it:

- **Market value** — every active listing is scored against the median of
  comparable cars (same make/model, widened to make/model-year when a line is
  too thin). A verdict — good deal / fair / overpriced — is only ever given
  when there are enough comparables to back it; otherwise it says so honestly.
- **Cross-portal duplicate detection** — the same physical car cross-posted to
  two portals at two prices, matched on make / model / year / registration
  prefix / city (Indian listing grids publish no full VIN or plate), with
  dealer-owned stock excluded by construction so a dealer's own inventory
  can't false-positive.
- **Delisting-derived days-on-market** — a listing vanishing between two
  scrapes is the only "sold" signal a portal gives. PriceProof captures it,
  with the real markdown path the car took before it went.

## How we built it — and the hard requirement

**All collection goes through Bright Data Scraper Studio.** No Playwright, no
Puppeteer, no raw HTTP scraping. Scraper Studio owns the proxying,
geo-targeting, CAPTCHA solving, JS rendering and self-healing; the app talks
to exactly two REST endpoints (`dca/trigger`, `dca/dataset`). That boundary is
the design: scraping is a solved, hosted concern, and the value we add is what
happens to the data afterward.

The data model is built to make that pay off:

- **Append-only.** `listing_snapshots` is the single source of truth and is
  never mutated. Every feature — valuation, duplicate detection,
  days-on-market — is a query over the snapshot history, so nothing is
  computed-and-thrown-away and new features are new queries, not new scrapes.
- **Catalog-driven.** Portals and listings are rows, not URLs baked into
  scraper config, so adding a portal or a model is data, not a code change.
- **Self-healing.** A scheduled GitHub Actions cron triggers collection and
  watches field coverage over time; when a target site changes shape under us,
  the Scraper Health page shows the coverage drop and the recovery rather than
  silently returning garbage.

**Stack:** React 19 + Vite + TypeScript + Tailwind v4 frontend; Node/tsx API;
Postgres (Supabase); Bright Data Scraper Studio for collection; GitHub Actions
for the scheduled, self-healing scrape.

## What makes it stand out

- **It answers questions, not "here's the data."** The dashboard leads with a
  verdict on the thing that needs attention, not a spreadsheet of every field
  scraped.
- **Honest about uncertainty.** "Insufficient comparables" is a first-class
  verdict. Duplicate matches are labelled *fuzzy · needs review* rather than
  asserted. The product never claims more confidence than the data supports.
- **A front end that's actually fast.** The interface holds 60fps on a laptop,
  verified by profiling — raster hotspots removed, all motion kept on the
  compositor, offscreen work skipped. A dev-only FPS badge keeps it honest.
  (See the Performance section in the README.)
- **Real, licence-cleared photography** of the exact models the platform
  tracks, with attribution recorded.

## Challenges

- **No VIN, no plate.** Indian listing grids don't publish a unique key, so
  duplicate detection had to be a defensible fuzzy match with dealer stock
  excluded by construction — precision over recall, and labelled as such.
- **"Sold" is never stated.** Portals don't tell you a car sold; they just
  stop listing it. Deriving days-on-market from delisting events meant the
  append-only snapshot history had to be the source of truth from day one.
- **Fast *and* rich.** The redesign had to add visual energy without
  reintroducing the scroll jank that a naïve dark-dashboard aesthetic causes —
  which is why every effect is compositor-only and the result was measured.

## What's next

- More portals and segments (both are just catalog rows).
- A confidence score on each valuation surfaced directly in the UI.
- Alerting on first markdown, not just on delisting.

## Run it

`/welcome` and `/racing` need only the frontend; the live dashboard needs the
API + Postgres. Full steps are in [`README.md`](../README.md) and
[`RUNNING.md`](../RUNNING.md); the judge walkthrough is in
[`demo-script.md`](demo-script.md).
