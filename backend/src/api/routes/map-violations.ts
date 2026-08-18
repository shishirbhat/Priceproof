import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const mapViolationsRouter = Router();

mapViolationsRouter.get("/", ah(async (_req, res) => {
  const { rows } = await pool.query(`
    with below_floor as (
      select
        s.id, s.store_product_id, s.current_price, s.scraped_at, s.is_seeded,
        mp.floor_price,
        lag(s.current_price < mp.floor_price) over (partition by s.store_product_id order by s.scraped_at) as prev_below,
        lag(s.scraped_at) over (partition by s.store_product_id order by s.scraped_at) as prev_scraped_at
      from snapshots s
      join store_products sp on sp.id = s.store_product_id
      join map_policies mp on mp.product_id = sp.product_id
    ),
    latest as (
      select distinct on (store_product_id) *
      from below_floor order by store_product_id, scraped_at desc
    )
    select
      l.*, p.id as product_id, p.title, p.image_url, st.name as store_name,
      round(100.0 * (l.floor_price - l.current_price) / l.floor_price, 1) as pct_below_floor
    from latest l
    join store_products sp on sp.id = l.store_product_id
    join products p on p.id = sp.product_id
    join stores st on st.id = sp.store_id
    where l.current_price < l.floor_price
    order by pct_below_floor desc
  `);
  res.json(rows);
}));
