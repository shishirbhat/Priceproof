import type { PoolClient } from "pg";
import type { CollectorRow } from "./brightdata-client.js";

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

interface Identity {
  canonicalKey: string;
  matchConfidence: number | null; // null = exact identity (gtin/ean/sku), not a fuzzy score
  needsReview: boolean;
}

/**
 * gtin/ean/sku present -> exact identity. Otherwise fuzzy title(+brand) match,
 * always flagged for review since a title collision across unrelated stores
 * can't be ruled out automatically. Never silently claim an exact match
 * without an exact identifier.
 */
function computeIdentity(row: {
  title: string;
  brand: string | null;
  gtin: string | null;
  sku: string | null;
}): Identity {
  if (row.gtin) {
    return { canonicalKey: `gtin:${row.gtin}`, matchConfidence: null, needsReview: false };
  }
  if (row.sku) {
    return { canonicalKey: `sku:${row.sku}`, matchConfidence: null, needsReview: false };
  }
  if (row.brand) {
    const key = `bt:${normalize(row.brand)}|${normalize(row.title)}`;
    return { canonicalKey: key, matchConfidence: 0.7, needsReview: false };
  }
  return { canonicalKey: `t:${normalize(row.title)}`, matchConfidence: 0.4, needsReview: true };
}

/**
 * Field mapping from the confirmed collector output shape (see
 * samples/README.md). list_price/brand/sku/gtin are known gaps — the
 * collector doesn't emit them yet, so every extraction here is optional and
 * nullable by design. Adding a field to the collector's mapping requires no
 * code change here as long as the key name matches.
 */
function extract(row: CollectorRow) {
  const input = (row.input ?? {}) as Record<string, unknown>;
  return {
    title: String(row.product_title ?? ""),
    currentPrice: Number(row.current_price),
    listPrice: row.list_price != null ? Number(row.list_price) : null,
    currency: String(row.currency_code ?? "USD"),
    inStock: Boolean(row.in_stock),
    scarcityText: row.stock_scarcity_text != null ? String(row.stock_scarcity_text) : null,
    canonicalUrl: String(row.canonical_url ?? input.url ?? ""),
    imageUrl: row.main_image_url != null ? String(row.main_image_url) : null,
    brand: row.brand != null ? String(row.brand) : null,
    sku: row.sku != null ? String(row.sku) : null,
    gtin: (row.gtin ?? row.ean) != null ? String(row.gtin ?? row.ean) : null,
    // '' rather than null: Postgres unique constraints don't dedupe across
    // NULL, so a null region_code would defeat the ON CONFLICT below and
    // insert a fresh store_products row on every ingest run.
    regionCode: input.zip_code != null ? String(input.zip_code) : "",
  };
}

export async function ingestRow(
  client: PoolClient,
  storeId: number,
  raw: CollectorRow,
  isSeeded: boolean,
  scrapedAt: Date,
): Promise<void> {
  const f = extract(raw);
  if (!f.title || !f.canonicalUrl || Number.isNaN(f.currentPrice)) {
    console.warn("skipping row missing required fields:", raw);
    return;
  }

  const identity = computeIdentity(f);

  const productRes = await client.query<{ id: number }>(
    `insert into products (canonical_key, title, brand, gtin, sku, image_url)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (canonical_key) do update set
       title = excluded.title,
       image_url = coalesce(excluded.image_url, products.image_url)
     returning id`,
    [identity.canonicalKey, f.title, f.brand, f.gtin, f.sku, f.imageUrl],
  );
  const productId = productRes.rows[0].id;

  const storeProductRes = await client.query<{ id: number }>(
    `insert into store_products
       (store_id, product_id, product_url, region_code, match_confidence, needs_review)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (store_id, product_id, region_code)
       do update set product_url = excluded.product_url
     returning id`,
    [
      storeId,
      productId,
      f.canonicalUrl,
      f.regionCode,
      identity.matchConfidence,
      identity.needsReview,
    ],
  );
  const storeProductId = storeProductRes.rows[0].id;

  await client.query(
    `insert into snapshots
       (store_product_id, current_price, list_price, currency, in_stock,
        scarcity_text, raw_json, scraped_at, is_seeded)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      storeProductId,
      f.currentPrice,
      f.listPrice,
      f.currency,
      f.inStock,
      f.scarcityText,
      JSON.stringify(raw),
      scrapedAt.toISOString(),
      isSeeded,
    ],
  );
}
