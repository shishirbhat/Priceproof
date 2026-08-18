import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const availabilityRouter = Router();

// Stockout/restock feed. For a restock row, gap_seconds is the FULL
// duration of the stockout streak that just ended (from when it first went
// out of stock to now) — not just the gap to the immediately preceding
// snapshot, which at daily cadence would always read ~1 day regardless of
// whether the item was out for 1 day or 3 weeks.
availabilityRouter.get(
  "/events",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
    with flagged as (
      select
        s.id, s.store_product_id, s.in_stock, s.scarcity_text, s.scraped_at, s.is_seeded,
        lag(s.in_stock) over (partition by s.store_product_id order by s.scraped_at) as prev_in_stock,
        lag(s.scraped_at) over (partition by s.store_product_id order by s.scraped_at) as prev_scraped_at
      from snapshots s
    ),
    runs as (
      select
        *,
        sum(case when in_stock is distinct from prev_in_stock then 1 else 0 end)
          over (partition by store_product_id order by scraped_at) as run_id
      from flagged
    ),
    run_starts as (
      select store_product_id, run_id, min(scraped_at) as run_start
      from runs
      group by store_product_id, run_id
    )
    select
      f.id, f.store_product_id, f.in_stock, f.scarcity_text, f.scraped_at, f.is_seeded,
      f.prev_in_stock, f.prev_scraped_at,
      p.id as product_id, p.title, st.name as store_name,
      case
        when f.in_stock and f.prev_in_stock = false
          then extract(epoch from (f.scraped_at - prev_run.run_start))
        else extract(epoch from (f.scraped_at - f.prev_scraped_at))
      end as gap_seconds
    from runs f
    join run_starts prev_run
      on prev_run.store_product_id = f.store_product_id and prev_run.run_id = f.run_id - 1
    join store_products sp on sp.id = f.store_product_id
    join products p on p.id = sp.product_id
    join stores st on st.id = sp.store_id
    where f.prev_in_stock is not null and f.in_stock is distinct from f.prev_in_stock
    order by f.scraped_at desc
  `);
    res.json(rows);
  }),
);

availabilityRouter.get(
  "/rate",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
    select
      st.name as store_name, p.category,
      round(100.0 * sum(case when s.in_stock then 1 else 0 end) / count(*), 1) as availability_pct
    from snapshots s
    join store_products sp on sp.id = s.store_product_id
    join stores st on st.id = sp.store_id
    join products p on p.id = sp.product_id
    group by st.name, p.category
    order by st.name, p.category
  `);
    res.json(rows);
  }),
);
