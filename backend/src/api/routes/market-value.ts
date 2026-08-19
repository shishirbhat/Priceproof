import { Router } from "express";
import { pool } from "../../db/client.js";
import { computeMarketValues } from "../market-value.js";
import { ah } from "../async-handler.js";

export const marketValueRouter = Router();

marketValueRouter.get(
  "/",
  ah(async (_req, res) => {
    const rows = await computeMarketValues(pool);
    res.json(rows);
  }),
);

// Full price/odometer history for one listing, for the chart overlay
// (asking price over time, any struck-through original price the portal
// showed, and the listing's segment median for context).
marketValueRouter.get(
  "/:listingId/history",
  ah(async (req, res) => {
    const listingId = Number(req.params.listingId);
    const { rows } = await pool.query(
      `select id, scraped_at, current_price, original_price, odometer_km, is_seeded
       from listing_snapshots
       where listing_id = $1
       order by scraped_at asc`,
      [listingId],
    );
    res.json(rows);
  }),
);
