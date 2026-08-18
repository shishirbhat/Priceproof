import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";
import { runCollectionForStore } from "../../worker/run-collector.js";

export const catalogRouter = Router();

catalogRouter.get(
  "/stores",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      select
        st.*,
        count(distinct sp.id) as tracked_products,
        max(c.triggered_at) as last_collection_at
      from stores st
      left join store_products sp on sp.store_id = st.id
      left join collections c on c.store_id = st.id
      group by st.id
      order by st.name
    `);
    res.json(rows);
  }),
);

// Fires the trigger/poll/ingest cycle without blocking the response — the
// caller gets an immediate "triggered" ack; the multi-minute poll runs after
// the response is sent, same as the CLI worker, never inline in the request.
catalogRouter.post(
  "/stores/:storeId/collect",
  ah(async (req, res) => {
    const storeId = Number(req.params.storeId);
    runCollectionForStore(storeId).catch((err) => {
      console.error(`manual collection trigger failed for store ${storeId}:`, err);
    });
    res.status(202).json({ triggered: true, store_id: storeId });
  }),
);
