# Demo script

~5-6 minutes with the landing page opener, ~4-5 without. Never live-scrape
during the demo — everything below runs against the seeded database. If
you want to prove the pipeline is real, do that *before* the demo starts
(`npm run collect`), not during it.

## 0. Landing page opener (45s, optional but strong)

Open `/welcome` fresh (not a client-side nav — a real page load, so the
preloader actually plays). Let the "N%" counter run, don't skip it — it's
a 1.5s "arrival" moment, not dead air. Scroll through hero → the live
dashboard showcase (point out it's a real `iframe` of the actual app, not
a screenshot — "this can't go stale because it *is* the app") → the
price-cut chart demo in "how it works" (same chart component the
dashboard renders, canned data — a real 48-day markdown pattern: 680,000
down to 590,000 in two cuts). End on the color-inverted CTA, click
"Enter dashboard."

## 1. Command Center (30s)

Open on `/`. Point at the KPI row first — 15 listings tracked, 2 portals,
15 price changes in the last 24h, 1 cross-portal match, 1 overpriced
listing right now. Say the numbers out loud, then: "every one of these is
a live query over an append-only listing_snapshots table, not a cached
dashboard metric."

Point at "Notable market-value calls" — a Good deal and an Overpriced
Swift both surface here. That contrast is the headline: the system
doesn't just show you a price, it tells you whether that price makes
sense relative to everything comparable it's tracking.

## 2. Market Value — the hero feature (90s)

Click into Market Value. Filter to **Good deal** first — open the **2019
Maruti Swift LXI** card. Walk it: "seven comparable Swifts tracked across
five cities. This one is priced ₹4,18,660 against a segment median of
₹5,32,661 — 21% below market. High odometer, individual seller — that's
not a data error, that's a genuinely underpriced car."

Then filter to **Overpriced** — the **2021 Maruti Swift ZXI AMT** sits
17% above the same seven-car segment. "Low odometer alone doesn't
justify that premium once you can actually see six comparable asking
prices."

Then filter to **Insufficient comparables** — open a **Hyundai Creta**.
"Only one other Creta exists in this dataset. The app could still spit
out a number here, but it would be lying about its own confidence — so
it says exactly that instead."

This is the moment to state the product angle explicitly: portals show
you one asking price with no reference point. This page *is* the
reference point, computed continuously from every other comparable
listing being tracked, not eyeballed against a gut feeling.

## 3. Cross-Portal Matches (30s)

Click into Cross-Portal Matches — the **Toyota Innova Crysta 2.4 GX
2017** pair. "Same car — same registration prefix, same city, same
mileage — listed on Cars24 at ₹12,56,230 and on CarWale ten days later
at ₹11,83,381, a 5.8% gap. Matched fuzzy, flagged 'needs review,' because
no India listings portal publishes a full VIN or plate on its results
grid — honest about the confidence level instead of pretending to
certainty a real VIN match would give."

## 4. Market Activity (45s)

Click into Market Activity. "This whole page runs on one signal: a
listing disappearing from a portal's results between two collection
runs. No portal tells you 'sold' — we infer it." Point at the delisting
feed: the **2018 Tata Nexon XZ** sold after 48 days and three price
cuts (680,000 → 650,000 → 620,000 → 590,000); the **2021 Honda City ZX**
sold in 3 days flat, no markdown needed. "Same signal, two completely
different stories — that contrast is the product."

## 5. Scraper Health (45s)

This is the platform-usage proof, not just a status page. Show the
page-load gauge and the field-coverage bars. If a live collection has
been run before the demo, point at a real collection row (status,
duration, page loads used) and a coverage bar. If not, say so plainly:
"this page is honestly empty right now because we haven't burned a live
collection — the empty state tells you exactly what command fixes that,
not just 'no data.'"

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

## 6. Alerts + Catalog (30s)

**Alerts** — create one live (listing dropdown → rule → threshold →
Create). Pick the overpriced Swift + "priced below market by %" so it's
visibly not already firing, or pick the Nexon (already delisted) + "sold
/ delisted" so it fires immediately on creation.

**Catalog Management** — two portals wired in (Cars24, CarWale), each
showing its Scraper Studio collector id and a manual "Trigger collection"
button.

## 7. Close (15s)

"Every row with a gray 'Simulated history' badge is generated demo
data, labeled as such everywhere it appears — nothing here pretends to
be a real scrape that isn't one. The pipeline underneath is real: same
schema, same worker, same market-value logic runs whether the row came
from seeding or from `npm run collect` five minutes ago."

## If something breaks live

- Blank page / stuck skeleton → backend not running. `cd backend && npm run dev`.
- All pages showing errors → check `backend/.env` has `DATABASE_URL`.
- Wrong data / looks stale → `cd backend && npm run seed -- --force` to
  regenerate history (~60s), or just restart both dev servers.
