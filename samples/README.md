# Collector output — field notes

## Car listings (`collector_output.json`) — current target

**Provenance, honestly:** this is hand-authored from four real listing cards
directly observed on `cars24.com/buy-used-car/` (rendered DOM text, checked
with a real browser, not a summarized fetch) — it is **not yet a real
Scraper Studio run**. It exists so schema/ingestion/seed work isn't blocked
waiting on the collector to be built in the Bright Data dashboard. Replace
this file with the actual `dca/dataset` output the first time the real
collector runs, the same way the original shop collector's sample was
replaced with a real run early in this project.

Confirmed by direct inspection, unauthenticated, no login wall:

```
listing_id            string   numeric id embedded in the listing URL
listing_url            string
title                    string   raw as shown, e.g. "2017 Hyundai Grand i10 SPORTZ 1.2 KAPPA VTVT"
odometer_km              number
fuel_type                 string
transmission              string
registration_prefix       string   state+RTO code, e.g. "GJ-02" — partial identifier, NOT a full plate or VIN
city                       string
current_price               number
original_price               number|null  present only when the portal itself shows a struck-through price
seller_type                   string
main_image_url               string
input                          object   echoes trigger input, same pattern as the shop collector
```

## Known gaps (confirmed absent from the target site, not a collector miss)

No India used-car marketplace publishes a full VIN or full registration
plate on a search-results grid — that's platform policy (it protects their
paid vehicle-history-check upsell), not something to chase as a scraper bug.
Also absent from the grid: previous-owner count, registration year (as
distinct from manufacture year), a specific seller/dealer name (only a
generic "Cars24 Owned Stock" badge), and "days listed."

None of this blocks the product:

- **Cross-portal duplicate matching** uses a fuzzy key (make, model, year,
  registration prefix, city, mileage band) instead of exact VIN — the
  fallback this was scoped around from the start.
- **Days-on-market** is derived, not read from the site: we track
  `first_seen_at` (first collection run a listing_id appears in) to
  `delisted_at` (first run it's absent from) ourselves. That's a better
  signal than a "days ago" label anyway — it's bounded by our own scrape
  cadence and we know exactly how bounded.
- **Seller name/count**, where absent, is left null — same "optional fields
  light up when the source actually has them" rule as `list_price` was for
  the old shop collector.

## One thing worth targeting deliberately: seller type

Every listing observed so far was "Cars24 Owned Stock" — Cars24's own
reconditioned inventory, which by definition can't have a cross-portal
duplicate (Cars24 owns the car outright). The site also has a "Verified
Direct Seller" segment (individual sellers) who *do* sometimes cross-post
the same car to multiple portals — that's the segment that makes the
cross-portal price-gap demo real rather than staged. Worth filtering toward
individual-seller listings, or building a second collector against a portal
with a larger individual-seller mix (CarWale: ~3,450 individual sellers vs
~420 dealers in one city alone, and it has its own "Recent Price Drop"
filter, confirming the price-cut concept generalizes across portals).

---

## Apparel listings (`demo_shop_output.json`) — retained as a dev fixture

Not part of the car-dealership product. Kept because it's a free, stable,
never-changing target that already proved the trigger→poll→JSON loop works
end to end — useful for testing the pipeline without burning page loads or
depending on a live car portal being up.

`demo_shop_output.json` is a real run against `ecommerce-shop-brd.vercel.app`
via Scraper Studio collector `c_msw8ijcf1akr6p8vch`. One object per input
URL:

```
product_title        string
current_price        number
currency_code        string   (e.g. "USD")
in_stock              boolean  real boolean
stock_scarcity_text   string   e.g. "Recently restocked, going fast."
canonical_url         string
main_image_url        string
input                 object   echoes trigger input, e.g. {"url": "..."}
```

No timestamp is returned. Ingestion stamps `scraped_at` itself.

Known gaps: `list_price`, `brand`, `sku`, `gtin`/`ean`, `seller` — none
mapped by this collector. `list_price` is real and DOM-detectable but only
present when an item is actually on sale (confirmed via raw HTML/RSC
payload, not a rendered/summarized fetch). No GTIN/UPC/model number exists
anywhere on this storefront — identity was `store_domain + URL slug`.
