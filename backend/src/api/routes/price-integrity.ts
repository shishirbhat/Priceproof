import { Router } from "express";
import { pool } from "../../db/client.js";
import { computeIntegrityVerdicts } from "../price-integrity.js";
import { ah } from "../async-handler.js";

export const priceIntegrityRouter = Router();

priceIntegrityRouter.get(
  "/",
  ah(async (_req, res) => {
    const rows = await computeIntegrityVerdicts(pool);
    res.json(rows);
  }),
);

// Full price/list_price history for one store_product, for the chart overlay
// (selling price, advertised list price, true 30-day low over time).
priceIntegrityRouter.get(
  "/:storeProductId/history",
  ah(async (req, res) => {
    const storeProductId = Number(req.params.storeProductId);
    const { rows } = await pool.query(
      `select
       id, scraped_at, current_price, list_price, is_seeded,
       min(current_price) over (
         order by extract(epoch from scraped_at)
         range between 2592000 preceding and current row
       ) as true_30d_low
     from snapshots
     where store_product_id = $1
     order by scraped_at asc`,
      [storeProductId],
    );
    res.json(rows);
  }),
);
