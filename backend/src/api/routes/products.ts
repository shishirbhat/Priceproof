import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const productsRouter = Router();

productsRouter.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
    with latest as (
      select distinct on (store_product_id)
        store_product_id, current_price, list_price, in_stock, scarcity_text, scraped_at, is_seeded
      from snapshots
      order by store_product_id, scraped_at desc
    )
    select
      p.id as product_id, p.title, p.brand, p.category, p.image_url,
      sp.id as store_product_id, sp.region_code, sp.needs_review,
      st.id as store_id, st.name as store_name,
      l.current_price, l.list_price, l.in_stock, l.scarcity_text, l.scraped_at, l.is_seeded
    from store_products sp
    join products p on p.id = sp.product_id
    join stores st on st.id = sp.store_id
    join latest l on l.store_product_id = sp.id
    order by p.title
  `);
    res.json(rows);
  }),
);

productsRouter.get(
  "/:productId",
  ah(async (req, res) => {
    const productId = Number(req.params.productId);

    const [product, storeProducts, snapshots, stockoutEvents] = await Promise.all([
      pool.query(`select * from products where id = $1`, [productId]),
      pool.query(
        `select sp.*, st.name as store_name from store_products sp
       join stores st on st.id = sp.store_id where sp.product_id = $1`,
        [productId],
      ),
      pool.query(
        `select s.* from snapshots s
       join store_products sp on sp.id = s.store_product_id
       where sp.product_id = $1 order by s.scraped_at asc`,
        [productId],
      ),
      // in_stock flips = availability events for this product's timeline
      pool.query(
        `with flips as (
         select s.*, sp.store_id,
           lag(s.in_stock) over (partition by s.store_product_id order by s.scraped_at) as prev_in_stock,
           lag(s.scraped_at) over (partition by s.store_product_id order by s.scraped_at) as prev_scraped_at
         from snapshots s join store_products sp on sp.id = s.store_product_id
         where sp.product_id = $1
       )
       select * from flips
       where prev_in_stock is not null and in_stock is distinct from prev_in_stock
       order by scraped_at asc`,
        [productId],
      ),
    ]);

    if (product.rows.length === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }

    res.json({
      product: product.rows[0],
      store_products: storeProducts.rows,
      snapshots: snapshots.rows,
      availability_events: stockoutEvents.rows,
    });
  }),
);
