import type { PoolClient } from "pg";
import type { CollectorRow } from "./brightdata-client.js";

/**
 * One row per field per collection: how many of this run's records had that
 * field present and non-null. The Scraper Health page diffs present_count
 * across collections over time to show drift (a field's coverage drops) and
 * recovery (it comes back after Bright Data's self-healing repairs the
 * collector) — see db/schema.sql for the sketch query.
 */
export async function recordFieldCoverage(
  client: PoolClient,
  collectionId: number,
  rows: CollectorRow[],
): Promise<void> {
  const fieldNames = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) fieldNames.add(key);
  }

  for (const field of fieldNames) {
    const presentCount = rows.filter(
      (row) => row[field] !== undefined && row[field] !== null,
    ).length;
    await client.query(
      `insert into field_coverage (collection_id, field_name, present_count, total_count)
       values ($1, $2, $3, $4)
       on conflict (collection_id, field_name) do update set
         present_count = excluded.present_count,
         total_count = excluded.total_count`,
      [collectionId, field, presentCount, rows.length],
    );
  }
}
