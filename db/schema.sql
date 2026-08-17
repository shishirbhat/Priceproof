-- PriceProof schema
-- Target: Supabase (Postgres)
--
-- Catalog-driven: stores and products are rows, not URLs baked into scraper
-- config. Adding a retailer + category should start tracking products without
-- code changes. snapshots is append-only and is the single source of truth —
-- every metric (fake-discount verdicts, stockout events, price spreads) is a
-- query over it, never a mutation of it.

create table if not exists stores (
  id            bigserial primary key,
  name          text not null,
  country       text,
  base_url      text not null unique,
  collector_id  text not null,          -- Bright Data collector id, starts with 'c_'
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists products (
  id             bigserial primary key,
  canonical_key  text not null unique,  -- gtin/ean when known, else normalized brand+title
  title          text not null,
  brand          text,
  gtin           text,
  sku            text,
  category       text,
  image_url      text,
  created_at     timestamptz not null default now()
);

-- The same product at a specific store and region.
create table if not exists store_products (
  id            bigserial primary key,
  store_id      bigint not null references stores(id),
  product_id    bigint not null references products(id),
  product_url   text not null,
  region_code   text not null default '', -- '' = no region set; proxy-targeted region, see samples/README.md re: unvalidated
  match_confidence numeric(3,2),        -- 0.00-1.00; null when identity is exact (gtin/ean/sku match)
  needs_review  boolean not null default false, -- low-confidence fuzzy match surfaced in UI, never silent
  created_at    timestamptz not null default now(),
  unique (store_id, product_id, region_code)
);

-- APPEND ONLY. Never update or delete a row — history is the whole point.
create table if not exists snapshots (
  id                bigserial primary key,
  store_product_id  bigint not null references store_products(id),
  current_price     numeric(10,2) not null,
  list_price        numeric(10,2),      -- nullable: only present in source DOM when item is discounted
  currency          text not null default 'USD',
  in_stock          boolean not null,
  scarcity_text     text,
  raw_json          jsonb not null,     -- full raw collector row, for audit/debugging/reprocessing
  scraped_at        timestamptz not null,
  is_seeded         boolean not null default false -- true for generated demo history; UI must label this
);

create index if not exists idx_snapshots_store_product_scraped_at on snapshots (store_product_id, scraped_at);
create index if not exists idx_snapshots_is_seeded on snapshots (is_seeded);

create table if not exists collections (
  id                  bigserial primary key,
  store_id            bigint not null references stores(id),
  snapshot_id_external text not null,   -- Bright Data's collection_id from /dca/trigger
  triggered_at        timestamptz not null default now(),
  completed_at         timestamptz,
  status               text not null default 'pending', -- pending | building | ready | failed
  record_count         integer,
  page_loads_used      integer
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
  id                bigserial primary key,
  user_id           text not null,       -- no auth system yet; opaque identifier
  store_product_id  bigint not null references store_products(id),
  rule_type         text not null,       -- price_below | price_drop_pct | back_in_stock | map_breach | integrity_failure
  threshold         numeric(10,2),
  channel           text not null default 'in_app', -- in_app | email
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create table if not exists alert_events (
  id          bigserial primary key,
  alert_id    bigint not null references alerts(id),
  fired_at    timestamptz not null default now(),
  payload     jsonb not null            -- snapshot id + computed values that triggered it
);

-- MAP floors, one per product (not per store — MAP is set by the brand, applies everywhere)
create table if not exists map_policies (
  id          bigserial primary key,
  product_id  bigint not null references products(id) unique,
  floor_price numeric(10,2) not null,
  currency    text not null default 'USD',
  created_at  timestamptz not null default now()
);

-- Derived views (computed, not stored) — sketch, implemented alongside features:
--
-- v_price_integrity: per store_product, true_30d_low = min(current_price) over
--   the trailing 30 days of snapshots. Verdict:
--     INSUFFICIENT_HISTORY  if fewer than N days of snapshots exist
--     GENUINE                if claimed list_price <= true_30d_low * (1 + tolerance)
--     INFLATED                otherwise
--   Never emit GENUINE/INFLATED without enough history — INSUFFICIENT_HISTORY
--   is a first-class verdict, not a fallback.
--
-- v_stockout_events: LAG(in_stock) OVER (PARTITION BY store_product_id
--   ORDER BY scraped_at) to find flips; time-to-restock = gap between an
--   out-flip and the next in-flip.
--
-- v_competitive_matrix: per product_id, current_price per store_product
--   (latest snapshot), spread = max - min across matched store_products.
--
-- v_map_violations: current_price < map_policies.floor_price, duration = how
--   long the latest run of snapshots has stayed below floor.
