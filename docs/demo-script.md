# Demo script

~4-5 minutes. Never live-scrape during the demo — everything below runs
against the seeded database. If you want to prove the pipeline is real,
do that *before* the demo starts (`npm run collect`), not during it.

## 1. Command Center (30s)

Open on `/`. Point at the KPI row first — 9 SKUs, 1 store, 1 active
stockout, 1 open MAP violation, 2 discount-integrity failures. Say the
numbers out loud, then: "every one of these is a live query over an
append-only snapshot table, not a cached dashboard metric."

Point at "Discount integrity claims" — two are flagged Inflated, two
Genuine, one Insufficient history. That spread is the headline: the
system doesn't just flag things, it tells you when it *can't* tell you
something yet.

## 2. Price Integrity — the hero feature (90s)

Click into Price Integrity. Open the **Echo Portable Speaker** card
first — it's the clearest INFLATED case.

Walk the chart left to right: "flat blue line for 54 days, then six days
before the claimed sale, the red list-price line jumps up 35% while the
blue selling price barely moves. Then the 'sale' drops the price back to
roughly where it always was, but advertises it against that inflated
red line." Read the inline verdict line: the was-price is 39% above the
true 30-day low.

Then open **Pulse Smartwatch** — same chart shape, opposite conclusion:
the red line sits right on top of where the blue line already was.
Genuine markdown, verdict says so.

Then **Kiln Ceramic Mug** — Insufficient history. "This is a
just-added competitor SKU. It's claiming a discount today, and we
deliberately don't have an opinion yet — five days of data isn't enough
to check a 30-day rule, so the app says that instead of guessing."

This is the moment to state the compliance angle explicitly: EU Omnibus
Directive / UK CMA / India CCPA all require the advertised discount to
reference the actual lowest price in the preceding 30 days. This page
*is* that check, running continuously, not audited by hand.

## 3. Scraper Health (45s)

This is the platform-usage proof, not just a status page. Show the
page-load gauge and the field-coverage bars. If a live collection has
been run before the demo, point at a real collection row (status,
duration, page loads used) and a coverage bar. If not, say so plainly:
"this page is honestly empty right now because we haven't burned a live
collection — the empty state tells you exactly what command fixes that,
not just 'no data.'"

If you did run a live collection ahead of time: mention the two DOM
patterns and the honeypot decoys found while investigating the target
site (see `samples/README.md`) — that's concrete evidence of engaging
with what Scraper Studio actually does, not just hitting an endpoint.

**Then pull up the GitHub Actions tab.** `.github/workflows/scrape-cron.yml`
runs the real collection on a schedule, independent of anyone's laptop —
that's the "wall of green checks" proving the pipeline runs unattended.
Explain the second layer on top of it: every run compares field coverage
against the previous one, and if a field that was reliably present
collapses, a Claude Code agent step reads the drift report and the raw
payload, patches `ingest.ts`'s field mapping, commits directly, and a
third job re-runs the collection to *prove* the fix worked before calling
it green — a broken heal fails loudly instead of hiding. This is Bright
Data's own self-healing (proxies, selectors, CAPTCHA) plus a second,
independent healing layer on our side of the integration: what happens
when *our* mapping code goes stale, not just their scraper.

## 4. Quick tour (60s)

- **Availability & Stockouts** — live feed, and the corrected
  time-to-restock stat (7.0d / 4.0d, not a flat "1 day" — worth
  mentioning this was a real bug caught by inspecting the numbers, not
  just eyeballing the UI).
- **MAP Violations** — Everyday Cotton Tee, 16.6% below floor, still
  open today.
- **Competitive Landscape** — honestly labeled as single-store right
  now; the matrix structure is built for N stores, just needs a second
  one wired in.
- **Alerts** — create one live (product dropdown → rule → threshold →
  Create). Pick a product that's already breaching (e.g. Everyday Cotton
  Tee + MAP breach) — it evaluates immediately on creation, so
  "fired 1×" appears right after clicking Create, not after a wait.

## 5. Close (15s)

"Every row with a gray 'Simulated history' badge is generated demo
data, labeled as such everywhere it appears — nothing here pretends to
be a real scrape that isn't one. The pipeline underneath is real: same
schema, same worker, same verdict logic runs whether the row came from
seeding or from `npm run collect` five minutes ago."

## If something breaks live

- Blank page / stuck skeleton → backend not running. `cd backend && npm run dev`.
- All pages showing errors → check `backend/.env` has `DATABASE_URL`.
- Wrong data / looks stale → `cd backend && npm run seed -- --force` to
  regenerate history (~60s), or just restart both dev servers.
