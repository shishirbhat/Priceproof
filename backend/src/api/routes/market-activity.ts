import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const marketActivityRouter = Router();

// Delisting feed — a listing dropping out of a portal's results between two
// collection runs is the only sold/removed signal available, so this reads
// straight off delisted_at rather than any "sold" flag the site provides.
// days_on_market is bounded by scrape cadence: we only know the sale
// happened sometime between last_seen_at and delisted_at, not the exact day.
marketActivityRouter.get(
  "/events",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      with last_price as (
        select distinct on (listing_id) listing_id, current_price
        from listing_snapshots
        order by listing_id, scraped_at desc
      )
      select
        l.id as listing_id, l.title, l.make, l.model, l.year, l.city,
        p.name as portal_name, l.is_seeded,
        l.first_seen_at, l.last_seen_at, l.delisted_at,
        extract(epoch from (l.delisted_at - l.first_seen_at)) as days_on_market_seconds,
        lp.current_price as last_known_price
      from listings l
      join portals p on p.id = l.portal_id
      left join last_price lp on lp.listing_id = l.id
      where l.delisted_at is not null
      order by l.delisted_at desc
      limit 200
    `);
    res.json(rows);
  }),
);

// Average days-on-market for delisted listings, grouped by make — the
// "listings that cut price sell faster" style stat starts here, refined
// further once cross-referenced against listing_snapshots price-cut counts
// on the frontend.
marketActivityRouter.get(
  "/days-on-market",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      select
        make,
        count(*) as sold_count,
        round(avg(extract(epoch from (delisted_at - first_seen_at)) / 86400)::numeric, 1) as avg_days_on_market
      from listings
      where delisted_at is not null and make is not null
      group by make
      order by sold_count desc
    `);
    res.json(rows);
  }),
);

// Currently-active listings sitting longest without selling — the "aging
// inventory" view, complementary to the sold-events feed above.
marketActivityRouter.get(
  "/active-longest",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      select
        l.id as listing_id, l.title, l.make, l.model, l.year, l.city,
        p.name as portal_name, l.is_seeded, l.first_seen_at,
        extract(epoch from (now() - l.first_seen_at)) as days_active_seconds
      from listings l
      join portals p on p.id = l.portal_id
      where l.delisted_at is null
      order by l.first_seen_at asc
      limit 50
    `);
    res.json(rows);
  }),
);
