import { Router } from "express";
import { pool } from "../../db/client.js";
import { ah } from "../async-handler.js";
import { runCollectionForPortal } from "../../worker/run-collector.js";

export const catalogRouter = Router();

catalogRouter.get(
  "/portals",
  ah(async (_req, res) => {
    const { rows } = await pool.query(`
      select
        p.*,
        count(distinct l.id) filter (where l.delisted_at is null) as tracked_listings,
        max(c.triggered_at) as last_collection_at
      from portals p
      left join listings l on l.portal_id = p.id
      left join collections c on c.portal_id = p.id
      group by p.id
      order by p.name
    `);
    res.json(rows);
  }),
);

// Fires the trigger/poll/ingest cycle without blocking the response — the
// caller gets an immediate "triggered" ack; the multi-minute poll runs after
// the response is sent, same as the CLI worker, never inline in the request.
catalogRouter.post(
  "/portals/:portalId/collect",
  ah(async (req, res) => {
    const portalId = Number(req.params.portalId);
    runCollectionForPortal(portalId).catch((err) => {
      console.error(`manual collection trigger failed for portal ${portalId}:`, err);
    });
    res.status(202).json({ triggered: true, portal_id: portalId });
  }),
);
