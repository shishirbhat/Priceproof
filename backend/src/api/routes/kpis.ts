import { Router } from "express";
import { pool } from "../../db/client.js";
import { computeIntegrityVerdicts } from "../price-integrity.js";
import { ah } from "../async-handler.js";

export const kpisRouter = Router();

kpisRouter.get(
  "/",
  ah(async (_req, res) => {
  const [skus, stores, priceChanges24h, activeStockouts, mapViolations, integrity] =
    await Promise.all([
      pool.query(`select count(distinct id) as n from store_products`),
      pool.query(`select count(*) as n from stores where is_active`),
      pool.query(`
        with ranked as (
          select
            store_product_id, current_price, scraped_at,
            lag(current_price) over (partition by store_product_id order by scraped_at) as prev_price
          from snapshots
        )
        select count(*) as n from ranked
        where scraped_at > now() - interval '24 hours'
          and prev_price is not null and current_price <> prev_price
      `),
      pool.query(`
        with latest as (
          select distinct on (store_product_id) store_product_id, in_stock
          from snapshots order by store_product_id, scraped_at desc
        )
        select count(*) as n from latest where not in_stock
      `),
      pool.query(`
        with latest as (
          select distinct on (s.store_product_id) s.store_product_id, s.current_price, sp.product_id
          from snapshots s join store_products sp on sp.id = s.store_product_id
          order by s.store_product_id, s.scraped_at desc
        )
        select count(*) as n from latest l
        join map_policies mp on mp.product_id = l.product_id
        where l.current_price < mp.floor_price
      `),
      computeIntegrityVerdicts(pool),
    ]);

  res.json({
    skus_tracked: Number(skus.rows[0].n),
    stores: Number(stores.rows[0].n),
    price_changes_24h: Number(priceChanges24h.rows[0].n),
    active_stockouts: Number(activeStockouts.rows[0].n),
    open_map_violations: Number(mapViolations.rows[0].n),
    discount_integrity_failures: integrity.filter((r) => r.verdict === "INFLATED").length,
    });
  }),
);
