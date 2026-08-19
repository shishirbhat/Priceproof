import type { PoolClient } from "pg";
import type { CollectorRow } from "./brightdata-client.js";

/**
 * Best-effort parse of "2017 Hyundai Grand i10 SPORTZ 1.2 KAPPA VTVT" into
 * year/make/model. No collector field currently splits these — Scraper
 * Studio hands back the raw title, same as every India used-car portal
 * renders it. Deliberately does NOT attempt to split model from trim/variant
 * (e.g. "Grand i10" vs "SPORTZ 1.2 KAPPA VTVT") — that needs a real
 * make/model reference table to do honestly, and a wrong split would quietly
 * corrupt market-value grouping. `model` here is "everything after the
 * make," which the market-value query widens its comparable set around when
 * a segment turns out too narrow — see api/market-value.ts.
 */
function parseTitle(title: string): { year: number | null; make: string | null; model: string | null } {
  const yearMatch = title.match(/^(19|20)\d{2}/);
  const year = yearMatch ? Number(yearMatch[0]) : null;
  const rest = (year ? title.slice(yearMatch![0].length) : title).trim();
  const tokens = rest.split(/\s+/).filter(Boolean);
  const make = tokens[0] ?? null;
  const model = tokens.slice(1).join(" ") || null;
  return { year, make, model };
}

/**
 * Field mapping from the confirmed car-collector output shape (see
 * samples/README.md). Every field beyond title/current_price/listing id is
 * optional and nullable — India portals vary in what they render per card,
 * and the pipeline must not break when one is briefly missing rather than
 * genuinely renamed (that distinction is what the drift monitor is for).
 */
function extract(row: CollectorRow) {
  const input = (row.input ?? {}) as Record<string, unknown>;
  const title = String(row.title ?? "");
  const { year, make, model } = parseTitle(title);
  return {
    externalListingId: String(row.listing_id ?? ""),
    listingUrl: String(row.listing_url ?? input.url ?? ""),
    title,
    make,
    model,
    year,
    odometerKm: row.odometer_km != null ? Number(row.odometer_km) : null,
    fuelType: row.fuel_type != null ? String(row.fuel_type) : null,
    transmission: row.transmission != null ? String(row.transmission) : null,
    registrationPrefix: row.registration_prefix != null ? String(row.registration_prefix) : null,
    city: row.city != null ? String(row.city) : null,
    currentPrice: Number(row.current_price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    sellerType: row.seller_type != null ? String(row.seller_type) : null,
    imageUrl: row.main_image_url != null ? String(row.main_image_url) : null,
  };
}

/**
 * Upserts the listing dimension row and appends one listing_snapshots row.
 * Returns the external_listing_id actually ingested, so the caller can
 * diff "seen this run" against "active in DB" to detect delistings — a
 * listing going quiet is the only sold/removed signal a search-results
 * collector gives us; there's no persistent "sold" page to poll like the
 * old in_stock flip had.
 */
export async function ingestRow(
  client: PoolClient,
  portalId: number,
  raw: CollectorRow,
  isSeeded: boolean,
  scrapedAt: Date,
): Promise<string | null> {
  const f = extract(raw);
  if (!f.externalListingId || !f.title || Number.isNaN(f.currentPrice)) {
    console.warn("skipping row missing required fields:", raw);
    return null;
  }

  const listingRes = await client.query<{ id: number }>(
    `insert into listings
       (portal_id, external_listing_id, listing_url, title, make, model, year,
        odometer_km, fuel_type, transmission, registration_prefix, city,
        seller_type, main_image_url, is_seeded, last_seen_at, delisted_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, null)
     on conflict (portal_id, external_listing_id) do update set
       listing_url = excluded.listing_url,
       odometer_km = excluded.odometer_km,
       last_seen_at = excluded.last_seen_at,
       delisted_at = null
     returning id`,
    [
      portalId,
      f.externalListingId,
      f.listingUrl,
      f.title,
      f.make,
      f.model,
      f.year,
      f.odometerKm,
      f.fuelType,
      f.transmission,
      f.registrationPrefix,
      f.city,
      f.sellerType,
      f.imageUrl,
      isSeeded,
      scrapedAt.toISOString(),
    ],
  );
  const listingId = listingRes.rows[0].id;

  await client.query(
    `insert into listing_snapshots
       (listing_id, current_price, original_price, currency, odometer_km, raw_json, scraped_at, is_seeded)
     values ($1, $2, $3, 'INR', $4, $5, $6, $7)`,
    [listingId, f.currentPrice, f.originalPrice, f.odometerKm, JSON.stringify(raw), scrapedAt.toISOString(), isSeeded],
  );

  return f.externalListingId;
}

/**
 * Marks every currently-active listing for this portal that was NOT seen in
 * this collection run as delisted. Bounded precision by design: we only know
 * the sale/removal happened sometime between last_seen_at and scrapedAt, not
 * the exact moment — the days-on-market feature documents that bound rather
 * than hiding it.
 */
export async function markDelisted(
  client: PoolClient,
  portalId: number,
  seenExternalIds: string[],
  scrapedAt: Date,
): Promise<number> {
  const res = await client.query(
    `update listings
     set delisted_at = $3
     where portal_id = $1
       and delisted_at is null
       and not (external_listing_id = any($2::text[]))`,
    [portalId, seenExternalIds, scrapedAt.toISOString()],
  );
  return res.rowCount ?? 0;
}
