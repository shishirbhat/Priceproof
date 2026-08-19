import "dotenv/config";
import { pool } from "../db/client.js";
import { triggerCollection, pollDataset, type TriggerInput } from "./brightdata-client.js";
import { ingestRow, markDelisted } from "./ingest.js";
import { recordFieldCoverage } from "./schema-drift.js";
import { evaluateAlerts } from "./alert-evaluation.js";

/**
 * Runs one collection for one portal: trigger -> poll -> ingest -> mark
 * delistings -> record field coverage. Never call this from an HTTP request
 * handler — it blocks for however long Bright Data takes to build the
 * dataset (up to ~5 min). Intended to run from a scheduled job (cron) or
 * manually via `npm run collect`.
 *
 * Unlike the old per-URL product trigger, a car collector targets a single
 * search-results page (or a small handful — one per city) and gets back an
 * array of 20-40 listings per page load, so the trigger input list here is
 * just the portal's tracked search URLs, not one row per listing.
 */
export async function runCollectionForPortal(portalId: number): Promise<void> {
  const client = await pool.connect();
  try {
    const portalRes = await client.query<{ id: number; collector_id: string; base_url: string }>(
      `select id, collector_id, base_url from portals where id = $1 and is_active`,
      [portalId],
    );
    const portal = portalRes.rows[0];
    if (!portal) throw new Error(`no active portal with id ${portalId}`);

    // A search-results collector takes the results page itself as input —
    // one trigger input returns 20-40 listings, not one input per listing.
    const inputs: TriggerInput[] = [{ url: portal.base_url }];

    const collectionId = await triggerCollection(portal.collector_id, inputs);

    const collectionRes = await client.query<{ id: number }>(
      `insert into collections (portal_id, snapshot_id_external, status)
       values ($1, $2, 'building') returning id`,
      [portalId, collectionId],
    );
    const dbCollectionId = collectionRes.rows[0].id;

    let rows;
    try {
      rows = await pollDataset(collectionId);
    } catch (err) {
      await client.query(`update collections set status = 'failed' where id = $1`, [
        dbCollectionId,
      ]);
      throw err;
    }

    const scrapedAt = new Date();
    const seenExternalIds: string[] = [];
    await client.query("begin");
    try {
      for (const row of rows) {
        const externalId = await ingestRow(client, portalId, row, false, scrapedAt);
        if (externalId) seenExternalIds.push(externalId);
      }
      const delistedCount = await markDelisted(client, portalId, seenExternalIds, scrapedAt);
      await recordFieldCoverage(client, dbCollectionId, rows);
      await client.query(
        `update collections
         set status = 'ready', completed_at = now(), record_count = $2, page_loads_used = $2
         where id = $1`,
        [dbCollectionId, rows.length],
      );
      await client.query("commit");
      console.log(`portal ${portalId}: ${delistedCount} listing(s) newly marked delisted`);
    } catch (err) {
      await client.query("rollback");
      await client.query(`update collections set status = 'failed' where id = $1`, [
        dbCollectionId,
      ]);
      throw err;
    }

    const fired = await evaluateAlerts(pool);
    console.log(
      `portal ${portalId}: ingested ${rows.length} listings from collection ${collectionId}, ${fired} alert(s) fired`,
    );
  } finally {
    client.release();
  }
}

async function main() {
  const portalsRes = await pool.query<{ id: number }>(`select id from portals where is_active`);
  for (const { id } of portalsRes.rows) {
    await runCollectionForPortal(id);
  }
  await pool.end();
}

// Only auto-run when executed directly (`npm run collect`) — importing this
// module from the API server must NOT trigger every portal's collection as a
// side effect of the import.
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
