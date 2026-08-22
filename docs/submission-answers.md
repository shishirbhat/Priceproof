# Submission form answers + 3-minute video script

Everything below is copy-paste ready. The video script is timed to land
under 3:00 — read the **Say** lines aloud while doing the **Show** actions.

---

## Form answers

### What does your project do?

PriceProof is a market-value and listings-intelligence platform for used-car
marketplaces. It builds a continuous, cross-portal history of every tracked
listing and turns that history into three answers a single listing page can
never give you: whether an asking price is actually fair against comparable
cars, whether the same physical car is cross-posted to two portals at two
different prices, and how long cars like this really take to sell — derived
from when listings disappear, with the real markdowns they took first.

### What problem does your project solve, and who is it for?

A used-car listing shows one price, at one moment, on one portal. It can't
tell you if that price is fair, if the identical car is quietly listed 6%
cheaper elsewhere, or whether it's already been marked down twice because
nobody's buying — that intelligence only lives in the *history across
portals*, and no portal keeps it. PriceProof reconstructs it. It's for used-car
**buyers** who want to know if a deal is real before they act, and for
**dealers and market analysts** who need to price against the live market and
spot cross-posted or stale inventory. The same engine works for any
listings-driven marketplace where price and time-on-market matter.

### How did you use Scraper Studio in your project?

All data collection goes through **Bright Data Scraper Studio** — no
Playwright, no Puppeteer, no raw HTTP scraping. We scrape used-car **listing
pages on Indian marketplaces** (e.g. Cars24, CarWale): title, make, model,
year, asking price, odometer, city, registration prefix, seller type, listing
URL and main image. Scraper Studio owns everything that makes scraping hard —
proxying, geo-targeting, CAPTCHA solving, JS rendering and self-healing when a
target site changes shape — and our app talks to just two REST endpoints:
`dca/trigger` to start a collection and `dca/dataset` to poll results. Each
poll's rows are appended to an immutable `listing_snapshots` table that is the
single source of truth; every feature (valuation, duplicate detection,
days-on-market) is a query over that history. A scheduled GitHub Actions cron
re-triggers collection and watches field coverage over time, so when a portal
changes under us the Scraper Health page shows the drop and the recovery
instead of silently returning garbage. The boundary is deliberate: scraping is
a solved, hosted concern, and the value we add is what happens to the data
after it lands.

---

## 3-minute video script

> Record at 1440×900 or 1080p. App running locally: `npm run dev`, plus the
> API for the dashboard. Have `/welcome` open to start. Speak at a normal
> pace — this is ~430 words, which reads in just under 3 minutes.

**[0:00–0:20] About the project — open on `/welcome`**

- **Say:** "This is PriceProof — market-value intelligence for used-car
  marketplaces. A single car listing tells you one price, right now, on one
  site. PriceProof tells you what that price actually *means*."
- **Show:** the welcome hero; click through the segment switcher (Hatchback →
  SUV → Luxury) so the real cars swap.

**[0:20–0:45] The problem & who it's for**

- **Say:** "The intelligence buyers and dealers actually need — is this fair,
  is the same car cheaper elsewhere, how long until it sells — only exists in
  the *history across portals*, and no portal keeps it. So we build that
  history and read it."
- **Show:** click **Open Dashboard** → the Command Center.

**[0:45–1:15] Tech stack & architecture**

- **Say:** "All collection runs through Bright Data Scraper Studio — no
  Playwright, no raw scraping. We hit two endpoints, trigger and dataset, and
  append every result to an immutable snapshots table that's our single source
  of truth. On top of that: a Node and Postgres backend, a React and Tailwind
  front end, and a GitHub Actions cron that re-scrapes on a schedule and
  self-heals when a site changes."
- **Show:** the Command Center KPIs; hover the live "listings tracked" tile.

**[1:15–2:40] Demo — the features**

- **Say:** "Market Value scores every listing against the median of comparable
  cars — and only gives a verdict when there are enough comparables. If there
  aren't, it says so."
- **Show:** go to **Market Value**; point at a "good deal" and an "overpriced"
  verdict, and the "insufficient comparables" filter.
- **Say:** "Cross-Portal Matches finds the same physical car listed twice.
  There's no VIN on these sites, so we match on make, model, year,
  registration prefix and city — and label it 'needs review' rather than
  pretending it's certain."
- **Show:** **Cross-Portal Matches** → the flagged Innova with its price gap.
- **Say:** "A listing vanishing between scrapes is the only 'sold' signal a
  portal gives — so Market Activity turns delistings into real days-on-market."
- **Show:** **Market Activity**, then **Scraper Health** — "and this proves the
  collection is doing real work: field coverage per run, and recovery when a
  site changes."

**[2:40–3:00] Learning & close**

- **Say:** "The biggest lesson was to let Scraper Studio own the hard part —
  proxies, CAPTCHAs, self-healing — and spend our effort on an append-only
  model where every insight is just a query over history. That's PriceProof."
- **Show:** back to the Command Center; end on the logo.

---

### Recording tips

- QuickTime (Mac): File → New Screen Recording, pick the browser window.
- Do a silent dry-run once so the clicks land where the narration expects.
- If the dashboard cards are empty, the backend/DB isn't running — `/welcome`
  and `/racing` still demo the product's look with just `npm run dev`.
- Upload to YouTube as **Unlisted**, then paste that link into the form.
