import "dotenv/config";
import { writeFileSync, appendFileSync } from "node:fs";
import { pool } from "../db/client.js";

/**
 * Compares the two most recent completed collections for each active store.
 * A field that was reliably present (>=80% of rows) last run and has
 * collapsed (<=30% of rows) this run — or vanished entirely — means the
 * target site's shape likely changed and our extraction mapping in
 * ingest.ts is probably stale. That's the signal the CI healing step acts
 * on; this script only detects and reports, it never edits anything.
 *
 * Writes drift-report.json (consumed by the Claude Code healing step) and
 * appends `degraded=true|false` to $GITHUB_OUTPUT so the workflow can
 * branch on it. Safe on a fresh repo with <2 collections yet — reports
 * "no baseline to compare against" rather than false-flagging drift.
 */

const PRESENT_THRESHOLD = 0.8;
const DEGRADED_THRESHOLD = 0.3;

interface FieldRow {
  field_name: string;
  present_count: number;
  total_count: number;
}

async function main() {
  const { rows: stores } = await pool.query<{ id: number; name: string }>(
    `select id, name from stores where is_active`,
  );

  const degradedFields: Array<{
    store: string;
    field: string;
    was_pct: number;
    now_pct: number;
  }> = [];
  let sampleRawJson: unknown = null;
  let comparedAny = false;

  for (const store of stores) {
    const { rows: collections } = await pool.query<{ id: number; triggered_at: string }>(
      `select id, triggered_at from collections
       where store_id = $1 and status = 'ready'
       order by triggered_at desc limit 2`,
      [store.id],
    );
    if (collections.length < 2) continue; // no baseline yet for this store
    comparedAny = true;

    const [latest, previous] = collections;
    const [latestFields, previousFields] = await Promise.all([
      pool.query<FieldRow>(
        `select field_name, present_count, total_count from field_coverage where collection_id = $1`,
        [latest.id],
      ),
      pool.query<FieldRow>(
        `select field_name, present_count, total_count from field_coverage where collection_id = $1`,
        [previous.id],
      ),
    ]);

    const prevByField = new Map(previousFields.rows.map((f) => [f.field_name, f]));
    for (const f of latestFields.rows) {
      const prev = prevByField.get(f.field_name);
      if (!prev || prev.total_count === 0) continue;
      const wasPct = prev.present_count / prev.total_count;
      const nowPct = f.total_count > 0 ? f.present_count / f.total_count : 0;
      if (wasPct >= PRESENT_THRESHOLD && nowPct <= DEGRADED_THRESHOLD) {
        degradedFields.push({ store: store.name, field: f.field_name, was_pct: wasPct, now_pct: nowPct });
      }
    }
    // a field present before and completely absent now (key renamed/removed)
    for (const prev of previousFields.rows) {
      if (prev.present_count / prev.total_count < PRESENT_THRESHOLD) continue;
      const stillThere = latestFields.rows.some((f) => f.field_name === prev.field_name);
      if (!stillThere) {
        degradedFields.push({ store: store.name, field: prev.field_name, was_pct: 1, now_pct: 0 });
      }
    }

    if (degradedFields.length > 0 && sampleRawJson === null) {
      const { rows: sample } = await pool.query<{ raw_json: unknown }>(
        `select s.raw_json from snapshots s
         join store_products sp on sp.id = s.store_product_id
         where sp.store_id = $1
         order by s.scraped_at desc limit 1`,
        [store.id],
      );
      sampleRawJson = sample[0]?.raw_json ?? null;
    }
  }

  const degraded = degradedFields.length > 0;
  const report = {
    degraded,
    comparedAny,
    fields: degradedFields,
    sample_raw_json: sampleRawJson,
    checked_at: new Date().toISOString(),
  };

  writeFileSync("drift-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `degraded=${degraded}\n`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
