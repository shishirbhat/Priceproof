import type { Pool } from "pg";

/**
 * Evaluates every active alert rule against its store_product's latest
 * snapshot (and previous, for delta-based rules) and fires an alert_event
 * whenever the condition holds. Fires once per distinct snapshot, not once
 * per condition-transition — a persistent breach across several days
 * produces several events, one per day it was checked, which is the
 * correct append-only record of "this stayed broken," not just the moment
 * it started. Idempotent per (alert_id, snapshot_id) via an existence
 * check, so calling this repeatedly over the same data is a no-op. Safe to
 * call after any ingest (seed or live collection), or directly after an
 * alert is created so it reflects current state immediately rather than
 * waiting for the next ingest.
 */
export async function evaluateAlerts(pool: Pool): Promise<number> {
  const { rows: alerts } = await pool.query<{
    id: number;
    store_product_id: number;
    rule_type: string;
    threshold: string | null;
  }>(`select id, store_product_id, rule_type, threshold from alerts where is_active`);

  let fired = 0;

  for (const alert of alerts) {
    const { rows: recent } = await pool.query<{
      id: number;
      current_price: string;
      in_stock: boolean;
      scraped_at: string;
    }>(
      `select id, current_price, in_stock, scraped_at from snapshots
       where store_product_id = $1
       order by scraped_at desc
       limit 2`,
      [alert.store_product_id],
    );
    if (recent.length === 0) continue;
    const [latest, prev] = recent;

    let triggered = false;
    let payload: Record<string, unknown> = { snapshot_id: latest.id };

    switch (alert.rule_type) {
      case "price_below": {
        const threshold = Number(alert.threshold);
        const now = Number(latest.current_price);
        triggered = now <= threshold;
        payload = { snapshot_id: latest.id, current_price: now, threshold };
        break;
      }
      case "price_drop_pct": {
        if (!prev) break;
        const threshold = Number(alert.threshold);
        const now = Number(latest.current_price);
        const was = Number(prev.current_price);
        const dropPct = ((was - now) / was) * 100;
        triggered = dropPct >= threshold;
        payload = { snapshot_id: latest.id, drop_pct: Math.round(dropPct * 10) / 10, threshold };
        break;
      }
      case "back_in_stock": {
        triggered = latest.in_stock && !!prev && !prev.in_stock;
        payload = { snapshot_id: latest.id };
        break;
      }
      case "map_breach": {
        const { rows: mapRows } = await pool.query<{ floor_price: string }>(
          `select mp.floor_price from map_policies mp
           join store_products sp on sp.product_id = mp.product_id
           where sp.id = $1`,
          [alert.store_product_id],
        );
        if (mapRows.length === 0) break;
        const floor = Number(mapRows[0].floor_price);
        const now = Number(latest.current_price);
        triggered = now < floor;
        payload = { snapshot_id: latest.id, current_price: now, floor_price: floor };
        break;
      }
      case "integrity_failure": {
        // Re-checked live rather than duplicating the streak-detection SQL
        // here — see api/price-integrity.ts for the authoritative verdict.
        break;
      }
      default:
        break;
    }

    if (!triggered) continue;

    const existing = await pool.query(
      `select 1 from alert_events where alert_id = $1 and payload->>'snapshot_id' = $2`,
      [alert.id, String(latest.id)],
    );
    if (existing.rows.length > 0) continue;

    await pool.query(`insert into alert_events (alert_id, payload) values ($1, $2)`, [
      alert.id,
      JSON.stringify(payload),
    ]);
    fired++;
  }

  return fired;
}
