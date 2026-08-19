import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const listingsRouter = Router();

listingsRouter.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      with latest as (
        select distinct on (listing_id)
          listing_id, current_price, original_price, odometer_km, scraped_at, is_seeded
        from listing_snapshots
        order by listing_id, scraped_at desc
      )
      select
        l.id as listing_id, l.title, l.make, l.model, l.year, l.city,
        l.registration_prefix, l.seller_type, l.main_image_url, l.listing_url,
        l.needs_review, l.delisted_at, l.first_seen_at,
        p.id as portal_id, p.name as portal_name,
        lt.current_price, lt.original_price, lt.odometer_km, lt.scraped_at, lt.is_seeded
      from listings l
      join portals p on p.id = l.portal_id
      join latest lt on lt.listing_id = l.id
      order by lt.scraped_at desc
    `);
    res.json(rows);
  }),
);

listingsRouter.get(
  "/:listingId",
  ah(async (req, res) => {
    const listingId = Number(req.params.listingId);

    const [listing, snapshots, duplicateOf, duplicates] = await Promise.all([
      pool.query(
        `select l.*, p.name as portal_name, p.base_url as portal_base_url
         from listings l join portals p on p.id = l.portal_id
         where l.id = $1`,
        [listingId],
      ),
      pool.query(
        `select * from listing_snapshots where listing_id = $1 order by scraped_at asc`,
        [listingId],
      ),
      pool.query(
        `select l.id, l.title, l.listing_url, p.name as portal_name
         from listings src
         join listings l on l.id = src.duplicate_of_listing_id
         join portals p on p.id = l.portal_id
         where src.id = $1`,
        [listingId],
      ),
      pool.query(
        `select l.id, l.title, l.listing_url, p.name as portal_name
         from listings l join portals p on p.id = l.portal_id
         where l.duplicate_of_listing_id = $1`,
        [listingId],
      ),
    ]);

    if (listing.rows.length === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }

    res.json({
      listing: listing.rows[0],
      snapshots: snapshots.rows,
      duplicate_of: duplicateOf.rows[0] ?? null,
      duplicates: duplicates.rows,
    });
  }),
);
