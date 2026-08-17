import "dotenv/config";
import { pool } from "../db/client.js";
import { triggerCollection, pollDataset, type TriggerInput } from "./brightdata-client.js";
import { ingestRow } from "./ingest.js";
import { recordFieldCoverage } from "./schema-drift.js";

/**
 * Runs one collection for one store: trigger -> poll -> ingest -> record
 * field coverage. Never call this from an HTTP request handler — it blocks
 * for however long Bright Data takes to build the dataset (up to ~5 min).
 * Intended to run from a scheduled job (cron / n8n) or manually via `npm run collect`.
 */
async function runCollectionForStore(storeId: number): Promise<void> {
  const client = await pool.connect();
  try {
    const storeRes = await client.query<{
      id: number;
      collector_id: string;
    }>(`select id, collector_id from stores where id = $1 and is_active`, [storeId]);
    const store = storeRes.rows[0];
    if (!store) throw new Error(`no active store with id ${storeId}`);

    const spRes = await client.query<{ product_url: string; region_code: string }>(
      `select product_url, region_code from store_products where store_id = $1`,
      [storeId],
    );
    if (spRes.rows.length === 0) {
      console.log(`store ${storeId} has no tracked products yet, skipping`);
      return;
    }

    const inputs: TriggerInput[] = spRes.rows.map((r) => ({
      url: r.product_url,
      ...(r.region_code ? { zip_code: r.region_code } : {}),
    }));

    const collectionId = await triggerCollection(store.collector_id, inputs);

    const collectionRes = await client.query<{ id: number }>(
      `insert into collections (store_id, snapshot_id_external, status)
       values ($1, $2, 'building') returning id`,
      [storeId, collectionId],
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
    await client.query("begin");
    try {
      for (const row of rows) {
        await ingestRow(client, storeId, row, false, scrapedAt);
      }
      await recordFieldCoverage(client, dbCollectionId, rows);
      await client.query(
        `update collections
         set status = 'ready', completed_at = now(), record_count = $2, page_loads_used = $2
         where id = $1`,
        [dbCollectionId, rows.length],
      );
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      await client.query(`update collections set status = 'failed' where id = $1`, [
        dbCollectionId,
      ]);
      throw err;
    }

    console.log(`store ${storeId}: ingested ${rows.length} rows from collection ${collectionId}`);
  } finally {
    client.release();
  }
}

async function main() {
  const storesRes = await pool.query<{ id: number }>(`select id from stores where is_active`);
  for (const { id } of storesRes.rows) {
    await runCollectionForStore(id);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
