import type { Pool } from "pg";

/**
 * Evaluates every active alert rule against its listing's latest snapshot
 * (and previous, for delta-based rules) and fires an alert_event whenever
 * the condition holds. Fires once per distinct snapshot for persistent-state
 * rules (price_below, below_market_value) — a listing staying below
 * threshold across several days produces several events, one per day it was
 * checked, which is the correct append-only record of "this stayed true,"
 * not just the moment it started. `sold` is edge-triggered (fires once, when
 * delisted_at first appears). Idempotent per (alert_id, snapshot_id or
 * delisted_at) via an existence check, so calling this repeatedly over the
 * same data is a no-op. Safe to call after any ingest (seed or live
 * collection), or directly after an alert is created so it reflects current
 * state immediately rather than waiting for the next ingest.
 */
export async function evaluateAlerts(pool: Pool): Promise<number> {
  const { rows: alerts } = await pool.query<{
    id: number;
    listing_id: number;
    rule_type: string;
    threshold: string | null;
  }>(`select id, listing_id, rule_type, threshold from alerts where is_active`);

  let fired = 0;

  for (const alert of alerts) {
    let triggered = false;
    let dedupeKey = "";
    let payload: Record<string, unknown> = {};

    if (alert.rule_type === "sold") {
      const { rows } = await pool.query<{ delisted_at: string | null }>(
        `select delisted_at from listings where id = $1`,
        [alert.listing_id],
      );
      const delistedAt = rows[0]?.delisted_at;
      if (!delistedAt) continue;
      triggered = true;
      dedupeKey = delistedAt;
      payload = { delisted_at: delistedAt };
    } else {
      const { rows: recent } = await pool.query<{
        id: number;
        current_price: string;
        scraped_at: string;
      }>(
        `select id, current_price, scraped_at from listing_snapshots
         where listing_id = $1
         order by scraped_at desc
         limit 2`,
        [alert.listing_id],
      );
      if (recent.length === 0) continue;
      const [latest, prev] = recent;
      dedupeKey = String(latest.id);

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
        case "below_market_value": {
          // Re-checked live rather than duplicating the segment-median SQL
          // here — see api/market-value.ts for the authoritative verdict.
          const { rows: mv } = await pool.query<{ pct_below: string | null }>(
            `with active as (
              select l.make, l.model, l.year, ls.current_price
              from listings l
              join lateral (
                select current_price from listing_snapshots
                where listing_id = l.id order by scraped_at desc limit 1
              ) ls on true
              where l.delisted_at is null
            ),
            segment as (
              select percentile_cont(0.5) within group (order by current_price) as median, count(*) as n
              from active a2
              join listings l on l.id = $1
              where a2.make = l.make and a2.model = l.model
            )
            select
              case when segment.n >= 5
                then round(100.0 * (a.current_price - segment.median) / segment.median, 1)
                else null
              end as pct_below
            from active a
            join listings l on l.id = $1
            cross join segment
            where a.make = l.make and a.model = l.model
            limit 1`,
            [alert.listing_id],
          );
          const pctBelow = mv[0]?.pct_below != null ? Number(mv[0].pct_below) : null;
          const threshold = Number(alert.threshold);
          triggered = pctBelow !== null && pctBelow <= -Math.abs(threshold);
          payload = { snapshot_id: latest.id, pct_vs_median: pctBelow, threshold };
          break;
        }
        default:
          break;
      }
    }

    if (!triggered) continue;

    const existing = await pool.query(
      `select 1 from alert_events
       where alert_id = $1
         and (payload->>'snapshot_id' = $2 or payload->>'delisted_at' = $2)`,
      [alert.id, dedupeKey],
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
