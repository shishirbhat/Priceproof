import { Router } from "express";
import { pool } from "../../db/client.js";
import { computeMarketValues } from "../market-value.js";
import { ah } from "../async-handler.js";

export const kpisRouter = Router();

kpisRouter.get(
  "/",
  ah(async (_req, res) => {
    const [listings, portals, priceChanges24h, delisted24h, crossPortalMatches, marketValues] =
      await Promise.all([
        pool.query(`select count(*) as n from listings where delisted_at is null`),
        pool.query(`select count(*) as n from portals where is_active`),
        pool.query(`
          with ranked as (
            select
              listing_id, current_price, scraped_at,
              lag(current_price) over (partition by listing_id order by scraped_at) as prev_price
            from listing_snapshots
          )
          select count(*) as n from ranked
          where scraped_at > now() - interval '24 hours'
            and prev_price is not null and current_price <> prev_price
        `),
        pool.query(`
          select count(*) as n from listings
          where delisted_at is not null and delisted_at > now() - interval '24 hours'
        `),
        pool.query(`
          select count(*) as n from listings
          where duplicate_of_listing_id is not null and delisted_at is null
        `),
        computeMarketValues(pool),
      ]);

    res.json({
      listings_tracked: Number(listings.rows[0].n),
      portals: Number(portals.rows[0].n),
      price_changes_24h: Number(priceChanges24h.rows[0].n),
      newly_delisted_24h: Number(delisted24h.rows[0].n),
      cross_portal_matches: Number(crossPortalMatches.rows[0].n),
      overpriced_count: marketValues.filter((r) => r.verdict === "OVERPRICED").length,
    });
  }),
);
