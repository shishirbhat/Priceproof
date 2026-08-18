import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const availabilityRouter = Router();

// Stockout/restock feed with an approximate time-to-restock (gap to the
// immediately preceding snapshot — accurate to the ingest cadence, i.e. to
// the day for seeded data, closer to real-time once live collection runs
// more frequently).
availabilityRouter.get(
  "/events",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
    with flips as (
      select
        s.id, s.store_product_id, s.in_stock, s.scarcity_text, s.scraped_at, s.is_seeded,
        lag(s.in_stock) over (partition by s.store_product_id order by s.scraped_at) as prev_in_stock,
        lag(s.scraped_at) over (partition by s.store_product_id order by s.scraped_at) as prev_scraped_at
      from snapshots s
    )
    select f.*, p.title, st.name as store_name,
      extract(epoch from (f.scraped_at - f.prev_scraped_at)) as gap_seconds
    from flips f
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
