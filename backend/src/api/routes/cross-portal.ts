import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const crossPortalRouter = Router();

// Listings believed to be the same physical car listed on two different
// portals (almost always an individual seller cross-posting — dealer-owned
// stock can't have a duplicate elsewhere by definition). Matched on
// make/model/year/registration_prefix/city rather than VIN, since no India
// listings portal publishes a full VIN or plate on its results grid — see
// samples/README.md. match_confidence and needs_review carry over the same
// "never claim silent certainty on a fuzzy match" rule the old product
// matcher used.
crossPortalRouter.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      with latest_dup as (
        select distinct on (listing_id) listing_id, current_price
        from listing_snapshots order by listing_id, scraped_at desc
      ),
      latest_orig as (
        select distinct on (listing_id) listing_id, current_price
        from listing_snapshots order by listing_id, scraped_at desc
      )
      select
        dup.id as listing_id, dup.title as listing_title, dup.listing_url, dup.is_seeded,
        dup_portal.name as portal_name, ld.current_price as current_price,
        orig.id as matched_listing_id, orig.title as matched_title, orig.listing_url as matched_listing_url,
        orig_portal.name as matched_portal_name, lo.current_price as matched_price,
        dup.match_confidence, dup.needs_review,
        round(100.0 * (ld.current_price - lo.current_price) / lo.current_price, 1) as pct_price_gap
      from listings dup
      join listings orig on orig.id = dup.duplicate_of_listing_id
      join portals dup_portal on dup_portal.id = dup.portal_id
      join portals orig_portal on orig_portal.id = orig.portal_id
      join latest_dup ld on ld.listing_id = dup.id
      join latest_orig lo on lo.listing_id = orig.id
      where dup.delisted_at is null and orig.delisted_at is null
      order by abs(ld.current_price - lo.current_price) desc
    `);
    res.json(rows);
  }),
);
