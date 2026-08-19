-- PriceProof schema — used-car listing intelligence
-- Target: Supabase (Postgres)
--
-- Same mechanics as the original apparel build: catalog-driven (portals and
-- listings are rows, not URLs baked into scraper config), listing_snapshots
-- is append-only and is the single source of truth — every metric is a query
-- over it, never a mutation of it.
--
-- What's different from a retail SKU catalog: a car is (almost always) sold
-- by exactly one listing on one portal, so there's no store_products-style
-- fan-out of one product across many stores. What replaces exact-SKU
-- matching is (a) market-value scoring — group comparable listings and score
-- this one's price against the distribution, and (b) delisting-based
-- days-on-market — a listing disappearing from a portal's results between
-- two collection runs is read as "sold or removed," bounded by scrape
-- cadence. Cross-portal duplicates (the same physical car listed on two
-- portals, almost always by an individual seller — dealer-owned stock can't
-- have a duplicate elsewhere) are a rarer, explicit match, not the default.

-- One-time clean break from the apparel schema this replaces: table shapes
-- changed even for names that are reused (alerts/collections/field_coverage
-- now reference listings/portals, not store_products/stores), so
-- `create table if not exists` alone would leave a half-migrated schema on
-- any database that already ran the old version. Safe to drop — this is
-- hackathon demo data, not anything worth preserving across the pivot.
drop table if exists alert_events cascade;
drop table if exists alerts cascade;
drop table if exists field_coverage cascade;
drop table if exists collections cascade;
drop table if exists map_policies cascade;
drop table if exists snapshots cascade;
drop table if exists store_products cascade;
drop table if exists products cascade;
drop table if exists stores cascade;
drop table if exists listing_snapshots cascade;
drop table if exists listings cascade;
drop table if exists portals cascade;

create table if not exists portals (
  id            bigserial primary key,
  name          text not null,
  country       text,
  base_url      text not null unique,
  collector_id  text not null,          -- Bright Data collector id, starts with 'c_'
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- One row per unique listing ever seen. Mutable dimension row (first_seen_at
-- /last_seen_at/delisted_at get updated as new collections come in) — the
-- append-only guarantee belongs to listing_snapshots below, same split as
-- the old products/store_products vs snapshots design.
create table if not exists listings (
  id                     bigserial primary key,
  portal_id               bigint not null references portals(id),
  external_listing_id     text not null,   -- the id embedded in the portal's own listing URL
  listing_url              text not null,
  title                     text not null,  -- raw title as shown, e.g. "2017 Hyundai Grand i10 SPORTZ 1.2 KAPPA VTVT"
  make                      text,
  model                     text,
  variant                   text,
  year                      integer,
  odometer_km               integer,        -- most recent known reading; full history lives in listing_snapshots
  fuel_type                 text,
  transmission              text,
  registration_prefix       text,           -- state+RTO code, e.g. "GJ-02" — partial identifier, never a full plate/VIN
  city                       text,
  seller_type                text,           -- 'dealer' | 'individual' | portal-specific label, kept as free text
  seller_name                text,
  main_image_url             text,
  duplicate_of_listing_id    bigint references listings(id), -- set when this listing is believed to be the same physical car as an earlier listing on a DIFFERENT portal
  match_confidence           numeric(3,2),    -- 0.00-1.00; null when no duplicate suspected
  needs_review                boolean not null default false, -- low-confidence fuzzy duplicate match surfaced in UI, never silent
  first_seen_at               timestamptz not null default now(),
  last_seen_at                 timestamptz not null default now(), -- bumped every collection run the listing is still present in
  delisted_at                   timestamptz,     -- set when a previously-active listing is absent from a collection run; null = still on market
  is_seeded                     boolean not null default false, -- true for generated demo history; UI must label this
  created_at                     timestamptz not null default now(),
  unique (portal_id, external_listing_id)
);

create index if not exists idx_listings_portal_active on listings (portal_id) where delisted_at is null;
create index if not exists idx_listings_duplicate_of on listings (duplicate_of_listing_id);
create index if not exists idx_listings_segment on listings (make, model, year);

-- APPEND ONLY. Never update or delete a row — history is the whole point.
-- One row per (listing, collection run) — current_price and odometer_km as
-- of that run. original_price is only non-null when the portal itself shows
-- a struck-through price on that run (a price-cut-in-progress signal from
-- the source, distinct from the price-cut-over-time we compute ourselves by
-- diffing consecutive snapshots).
create table if not exists listing_snapshots (
  id                bigserial primary key,
  listing_id         bigint not null references listings(id),
  current_price       numeric(12,2) not null,
  original_price       numeric(12,2),
  currency             text not null default 'INR',
  odometer_km           integer,
  raw_json               jsonb not null,   -- full raw collector row, for audit/debugging/reprocessing
  scraped_at             timestamptz not null,
  is_seeded               boolean not null default false
);

create index if not exists idx_listing_snapshots_listing_scraped_at on listing_snapshots (listing_id, scraped_at);
create index if not exists idx_listing_snapshots_is_seeded on listing_snapshots (is_seeded);

create table if not exists collections (
  id                  bigserial primary key,
  portal_id            bigint not null references portals(id),
  snapshot_id_external text not null,   -- Bright Data's collection_id from /dca/trigger
  triggered_at          timestamptz not null default now(),
  completed_at           timestamptz,
  status                 text not null default 'pending', -- pending | building | ready | failed
  record_count             integer,
  page_loads_used           integer
);

-- Powers the schema-drift monitor: for each collection, how many records had
-- each field present vs total records. A field's present_count dropping to 0
-- (or well below total_count) is drift; recovering afterward is self-healing.
create table if not exists field_coverage (
  id             bigserial primary key,
  collection_id  bigint not null references collections(id),
  field_name     text not null,
  present_count  integer not null,
  total_count    integer not null,
  unique (collection_id, field_name)
);

create table if not exists alerts (
  id            bigserial primary key,
  user_id        text not null,       -- no auth system yet; opaque identifier
  listing_id      bigint not null references listings(id),
  rule_type       text not null,       -- price_below | price_drop_pct | below_market_value | sold
  threshold       numeric(12,2),
  channel         text not null default 'in_app', -- in_app | email
  is_active       boolean not null default true,
  created_at       timestamptz not null default now()
);

create table if not exists alert_events (
  id          bigserial primary key,
  alert_id    bigint not null references alerts(id),
  fired_at    timestamptz not null default now(),
  payload     jsonb not null            -- snapshot id + computed values that triggered it
);

-- Derived views (computed, not stored) — sketch, implemented alongside features:
--
-- v_market_value: group active listings (delisted_at is null) by
--   (make, model, year, a mileage band, city or nation-wide when a city has
--   too few comparables), compute percentile_cont price distribution within
--   the group, score each listing as pct above/below the segment median.
--   Never score against a segment with too few comparables — that's an
--   INSUFFICIENT_COMPARABLES verdict, same "don't fabricate confidence"
--   principle as the old INSUFFICIENT_HISTORY verdict.
--
-- v_days_on_market: for delisted listings, delisted_at - first_seen_at,
--   bounded by scrape cadence (a sale is only known to within the gap
--   between two collection runs — document this, don't hide it). For active
--   listings, now() - first_seen_at ("N days and counting").
--
-- v_price_cuts: LAG(current_price) OVER (PARTITION BY listing_id ORDER BY
--   scraped_at) to find drops between consecutive snapshots of the same
--   listing — count and magnitude per listing, feeds "listings that cut
--   price within 14 days sell N% faster" style stats.
--
-- v_cross_portal_matches: listings where duplicate_of_listing_id is not
--   null, joined back to the original — same physical car, two portals, two
--   prices, side by side.
