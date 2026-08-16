# samples/

Reference data captured from Bright Data Scraper Studio.

## collector_output.json

Real output from a Scraper Studio test run against Bright Data's demo shop
(`ecommerce-shop-brd.vercel.app`). One record, one input URL.

Everything downstream — database schema, normalization, price history — is written
against the field names in this file.

### Confirmed shape

Top level is a JSON array, one object per input URL. The collector echoes the input
back under an `input` key, which confirms the input schema is a single `url` field.
That echo is useful later: when the input schema grows to `{url, zip_code}`, the
region will come back attached to each record instead of needing to be tracked
separately.

| Field | Type | Notes |
|---|---|---|
| `product_title` | string | |
| `current_price` | number | Selling price. Unprefixed — pair with `currency_code`. |
| `currency_code` | string | ISO code, e.g. `USD` |
| `in_stock` | boolean | Real boolean, not a string |
| `stock_scarcity_text` | string | Free text, e.g. "Recently restocked, going fast." |
| `canonical_url` | string | |
| `main_image_url` | string | |
| `input.url` | string | Echo of the triggering input |

No timestamp is returned. Ingestion stamps `scraped_at` itself, which is preferable
anyway — one clock, consistent across stores.

### Known gaps

The collector did not capture these requested fields:

- **`list_price`** — the struck-through / MRP / "was" price. This one blocks the
  fake-discount feature entirely: detecting an inflated-then-discounted price needs
  both the selling price and the advertised original.
- `brand`
- `sku` / model number
- `gtin` / `ean` / `upc` — needed for reliable cross-store product matching; without
  an identifier, matching falls back to fuzzy title+brand comparison
- `discount_percent`
- `seller` / store name

Before treating these as collector bugs, confirm the demo shop actually renders them
on the page. A scraper cannot extract a struck-through price from a product page that
never shows one — in that case the gap is the target site, not the collector, and the
real target site needs to be chosen partly on whether it advertises list prices.
