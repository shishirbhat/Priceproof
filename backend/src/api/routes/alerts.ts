import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const alertsRouter = Router();

alertsRouter.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      select
        a.*, p.title, st.name as store_name,
        (select count(*) from alert_events ae where ae.alert_id = a.id) as fired_count,
        (select max(fired_at) from alert_events ae where ae.alert_id = a.id) as last_fired_at
      from alerts a
      join store_products sp on sp.id = a.store_product_id
      join products p on p.id = sp.product_id
      join stores st on st.id = sp.store_id
      order by a.created_at desc
    `);
    res.json(rows);
  }),
);

alertsRouter.post(
  "/",
  ah(async (req, res) => {
    const { store_product_id, rule_type, threshold, user_id } = req.body ?? {};
    if (!store_product_id || !rule_type) {
      res.status(400).json({ error: "store_product_id and rule_type are required" });
      return;
    }
    const { rows } = await pool.query(
      `insert into alerts (user_id, store_product_id, rule_type, threshold)
       values ($1, $2, $3, $4) returning *`,
      [user_id ?? "demo-user", store_product_id, rule_type, threshold ?? null],
    );
    res.status(201).json(rows[0]);
  }),
);

alertsRouter.delete(
  "/:id",
  ah(async (req, res) => {
    await pool.query(`update alerts set is_active = false where id = $1`, [Number(req.params.id)]);
    res.status(204).end();
  }),
);
