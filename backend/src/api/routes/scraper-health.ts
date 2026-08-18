import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";

export const scraperHealthRouter = Router();

scraperHealthRouter.get(
  "/collections",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
    select c.*, st.name as store_name,
      extract(epoch from (c.completed_at - c.triggered_at)) as duration_seconds
    from collections c
    join stores st on st.id = c.store_id
    order by c.triggered_at desc
    limit 100
  `);
    res.json(rows);
  }),
);

// Per field, coverage over the last N collections for a store — a field's
// present_count dropping toward 0 is drift; climbing back afterward is
// Bright Data's self-healing repairing the collector.
scraperHealthRouter.get(
  "/field-coverage",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
    select fc.*, c.triggered_at, c.store_id, st.name as store_name
    from field_coverage fc
    join collections c on c.id = fc.collection_id
    join stores st on st.id = c.store_id
    order by c.triggered_at asc, fc.field_name
  `);
    res.json(rows);
  }),
);
