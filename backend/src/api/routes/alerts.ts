import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";
import { evaluateAlerts } from "../../worker/alert-evaluation.js";

export const alertsRouter = Router();

alertsRouter.get(
  "/",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      select
        a.*, l.title, p.name as portal_name,
        (select count(*) from alert_events ae where ae.alert_id = a.id) as fired_count,
        (select max(fired_at) from alert_events ae where ae.alert_id = a.id) as last_fired_at
      from alerts a
      join listings l on l.id = a.listing_id
      join portals p on p.id = l.portal_id
      order by a.created_at desc
    `);
    res.json(rows);
  }),
);

alertsRouter.post(
  "/",
  ah(async (req, res) => {
    const { listing_id, rule_type, threshold, user_id } = req.body ?? {};
    if (!listing_id || !rule_type) {
      res.status(400).json({ error: "listing_id and rule_type are required" });
      return;
    }
    const { rows } = await pool.query(
      `insert into alerts (user_id, listing_id, rule_type, threshold)
       values ($1, $2, $3, $4) returning *`,
      [user_id ?? "demo-user", listing_id, rule_type, threshold ?? null],
    );
    // Reflect current state immediately rather than waiting for the next ingest.
    await evaluateAlerts(pool);
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
