# Collector output — field notes

`collector_output.json` is a real run against `ecommerce-shop-brd.vercel.app` via
Scraper Studio collector `c_msw8ijcf1akr6p8vch`. One object per input URL:

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

No timestamp is returned. Ingestion stamps `scraped_at` itself, which is preferable
anyway — one clock, consistent across stores.

## Known gaps (not yet in collector output)

`list_price`, `brand`, `sku`, `gtin`/`ean`, `seller` — none of these are mapped by
the collector yet. The ingestion layer treats all of them as optional/nullable so
the pipeline works today and lights up automatically once the collector maps them.

Before treating these as collector bugs: confirmed below that most of them
genuinely aren't rendered on the page at all (no per-product brand, no GTIN
anywhere on this storefront) — so the gap is largely the target site, not the
collector, with `list_price` as the one real exception (see next section).

## `list_price` — the important one

It's real and DOM-detectable, but **only present when an item is actually on
sale**. Confirmed pattern (checked raw HTML/RSC payload on multiple products,
not a rendered/summarized fetch):

```html
<input aria-label="{Product Name} price" value="$142.75">
<input aria-label="{Product Name} original price" class="...line-through..." value="$158.61">
```

The second element is absent on non-discounted products — that's correct site
behavior, not a scraper miss. `echo-portable-speaker` (the sample) isn't
currently discounted, hence no `list_price` in the sample output.

## Two different price-markup patterns on the same catalog

Checked all 9 catalog products directly (`/`, then each `/product/<slug>`).
The current-price element is NOT rendered consistently:

- Plain (echo-portable-speaker, dugout-baseball-cap, foundry-cast-iron-skillet):
  `<output aria-label="{Title} price">$83.11</output>`
- Accessibility-verbose (pulse-smartwatch, kiln-ceramic-mug, everyday-cotton-tee,
  pace-running-shorts, press-34-french-press, quiet-fleece-hoodie):
  `aria-label="{Title} price listed 240 whole 41 USD"` (visible digits are
  split across separate spans for animation, not present as plain text)

A single fixed CSS selector or literal aria-label suffix won't cover the whole
catalog — the collector's price extraction needs to handle both shapes (or
rely on Scraper Studio's own resilience to do it). Worth checking directly
before assuming one pattern generalizes.

## Scraper honeypots

The site plants decoy data aimed at naive scrapers:

- `aria-hidden="true"` divs containing fake `data-price` + `sku-XXXXXX` pairs
- A second `line-through` element with a garbled aria-label
  (`"price price listed 62 whole 86 USD"`) sitting next to the real
  original-price element

The real collector output above contains none of this decoy data — Scraper
Studio is already filtering it correctly. Keep this in mind for the Scraper
Health page: it's evidence of the platform doing real work, not just a
network client.

## Product identity

No GTIN/UPC/EAN/model number exists anywhere on this storefront. The one
brand-like string on the page ("Alto & Oak") is the *store's* name (site
header/footer), not a per-product brand. Identity for this store has to be
`store_domain + URL slug`; GTIN/EAN matching only applies once a store that
actually publishes it is added.

## Regional pricing

`zip_code` as a query param has no effect on server-rendered price — tested
three different zips against the same product URL, identical price each time.
Regional variation, if it exists, has to come from Bright Data's proxy
geo-targeting actually changing what the origin server sees, not from a URL
param this site reads. Unvalidated as of the schema decision — test this in
Scraper Studio before relying on it.
