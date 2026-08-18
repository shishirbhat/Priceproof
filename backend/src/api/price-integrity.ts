import type { Pool } from "pg";

export type IntegrityVerdict = "GENUINE" | "INFLATED" | "INSUFFICIENT_HISTORY";

export interface IntegrityRow {
  snapshot_id: number;
  store_product_id: number;
  product_id: number;
  title: string;
  image_url: string | null;
  store_name: string;
  product_url: string;
  scraped_at: string;
  current_price: string;
  list_price: string;
  true_30d_low: string | null;
  streak_start: string;
  history_start: string;
  is_seeded: boolean;
  verdict: IntegrityVerdict;
  inflation_pct: number | null;
}

// Tolerance for float/rounding noise between a claimed list_price and the
// true 30-day low before calling it INFLATED rather than GENUINE.
const TOLERANCE = 1.02;
const MIN_HISTORY_DAYS = 30;

/**
 * For every store_product currently claiming a discount (its most recent
 * snapshot has a non-null list_price), compares that claim against the true
 * 30-day low computed over the 30 days BEFORE the current discount streak
 * started — not including the discounted days themselves. Including the
 * sale's own (already-lowered) prices in the lookback would make the
 * discounted price trivially its own minimum, which would call nearly every
 * real discount "inflated" by definition. This mirrors the actual EU
 * Omnibus rule: the reference price is the lowest price in the 30 days
 * preceding the price reduction, not the reduced price itself.
 *
 * Never emits GENUINE/INFLATED without >= 30 days of prior history on
 * record — INSUFFICIENT_HISTORY is returned instead, deliberately, rather
 * than guessing.
 */
export async function computeIntegrityVerdicts(pool: Pool): Promise<IntegrityRow[]> {
  const { rows } = await pool.query(`
    with sale_flags as (
      select
        s.*,
        (s.list_price is not null) as is_sale,
        lag(s.list_price is not null) over (
          partition by s.store_product_id order by s.scraped_at
        ) as prev_is_sale
      from snapshots s
    ),
    streaks as (
      select
        *,
        sum(
          case when is_sale and (prev_is_sale is distinct from true) then 1 else 0 end
        ) over (partition by store_product_id order by scraped_at) as streak_id
      from sale_flags
    ),
    current_claims as (
      select
        *,
        row_number() over (partition by store_product_id order by scraped_at desc) as rn
      from streaks
      where is_sale
    ),
    streak_bounds as (
      select store_product_id, streak_id, min(scraped_at) as streak_start
      from streaks
      where is_sale
      group by store_product_id, streak_id
    ),
    history_bounds as (
      select store_product_id, min(scraped_at) as history_start
      from snapshots
      group by store_product_id
    )
    select
      cc.id as snapshot_id,
      cc.store_product_id,
      p.id as product_id,
      p.title,
      p.image_url,
      st.name as store_name,
      sp.product_url,
      cc.scraped_at,
      cc.current_price,
      cc.list_price,
      cc.is_seeded,
      sb.streak_start,
      hb.history_start,
      (sb.streak_start - hb.history_start) >= interval '${MIN_HISTORY_DAYS} days' as has_sufficient_history,
      (
        select min(s2.current_price) from snapshots s2
        where s2.store_product_id = cc.store_product_id
          and s2.scraped_at >= sb.streak_start - interval '${MIN_HISTORY_DAYS} days'
          and s2.scraped_at < sb.streak_start
      ) as true_30d_low
    from current_claims cc
    join streak_bounds sb
      on sb.store_product_id = cc.store_product_id and sb.streak_id = cc.streak_id
    join history_bounds hb on hb.store_product_id = cc.store_product_id
    join store_products sp on sp.id = cc.store_product_id
    join products p on p.id = sp.product_id
    join stores st on st.id = sp.store_id
    where cc.rn = 1
    order by cc.scraped_at desc
  `);

  return rows.map((r) => {
    const listPrice = Number(r.list_price);
    const trueLow = r.true_30d_low != null ? Number(r.true_30d_low) : null;
    let verdict: IntegrityVerdict;
    let inflationPct: number | null = null;
    if (!r.has_sufficient_history || trueLow === null) {
      verdict = "INSUFFICIENT_HISTORY";
    } else if (listPrice <= trueLow * TOLERANCE) {
      verdict = "GENUINE";
    } else {
      verdict = "INFLATED";
      inflationPct = Math.round(((listPrice - trueLow) / trueLow) * 1000) / 10;
    }
    delete r.has_sufficient_history;
    return { ...r, verdict, inflation_pct: inflationPct } as IntegrityRow;
  });
}
