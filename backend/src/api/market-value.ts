import type { Pool } from "pg";

export type MarketVerdict = "GOOD_DEAL" | "FAIR" | "OVERPRICED" | "INSUFFICIENT_COMPARABLES";

export interface MarketValueRow {
  listing_id: number;
  portal_id: number;
  portal_name: string;
  listing_url: string;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  city: string | null;
  odometer_km: number | null;
  main_image_url: string | null;
  is_seeded: boolean;
  current_price: string;
  segment_median: string | null;
  segment_size: number;
  segment_level: "make_model" | "make_year_band" | "insufficient";
  pct_vs_median: number | null;
  verdict: MarketVerdict;
}

// Minimum comparable listings (excluding the listing itself) required before
// a segment's median is trusted. Below this, widen the segment rather than
// score against 1-2 other cars — same "don't fabricate confidence" rule as
// the old INSUFFICIENT_HISTORY verdict.
const MIN_COMPARABLES = 4;
const GOOD_DEAL_THRESHOLD = -10; // >=10% below segment median
const OVERPRICED_THRESHOLD = 10; // >=10% above segment median

/**
 * Scores every currently-active listing against a comparable-set median
 * price instead of matching it to one specific product across stores — cars
 * don't have an exact-SKU equivalent, so "is this a good deal" has to be a
 * statistical statement about a segment, not a database join.
 *
 * Segment picked in two levels, widening only when the tighter one doesn't
 * have enough comparables:
 *   1. same make + model
 *   2. same make + model year within +/-1 (covers a thin model line)
 * Never scores against fewer than MIN_COMPARABLES comparables at any level
 * — INSUFFICIENT_COMPARABLES is returned instead of a low-confidence number
 * dressed up as a real one.
 */
export async function computeMarketValues(pool: Pool): Promise<MarketValueRow[]> {
  const { rows } = await pool.query(`
    with active as (
      select l.*, ls.current_price, ls.is_seeded as snapshot_is_seeded
      from listings l
      join lateral (
        select current_price, is_seeded
        from listing_snapshots
        where listing_id = l.id
        order by scraped_at desc
        limit 1
      ) ls on true
      where l.delisted_at is null
    ),
    make_model_stats as (
      select make, model,
        count(*) as segment_size,
        percentile_cont(0.5) within group (order by current_price) as segment_median
      from active
      where make is not null and model is not null
      group by make, model
    ),
    make_year_stats as (
      select make, year,
        count(*) as segment_size,
        percentile_cont(0.5) within group (order by current_price) as segment_median
      from active
      where make is not null and year is not null
      group by make, year
    )
    select
      a.id as listing_id,
      a.portal_id,
      p.name as portal_name,
      a.listing_url,
      a.title,
      a.make,
      a.model,
      a.year,
      a.city,
      a.odometer_km,
      a.main_image_url,
      a.snapshot_is_seeded as is_seeded,
      a.current_price,
      mm.segment_median as mm_median,
      coalesce(mm.segment_size, 0) - 1 as mm_comparables,
      my.segment_median as my_median,
      coalesce(my.segment_size, 0) - 1 as my_comparables
    from active a
    join portals p on p.id = a.portal_id
    left join make_model_stats mm on mm.make = a.make and mm.model = a.model
    left join make_year_stats my on my.make = a.make and my.year = a.year
    order by a.current_price desc
  `);

  const VERDICT_ORDER: Record<MarketVerdict, number> = {
    OVERPRICED: 0,
    GOOD_DEAL: 1,
    FAIR: 2,
    INSUFFICIENT_COMPARABLES: 3,
  };

  return rows
    .map((r) => {
    const currentPrice = Number(r.current_price);
    let segmentMedian: number | null = null;
    let segmentSize = 0;
    let segmentLevel: MarketValueRow["segment_level"] = "insufficient";

    if (r.mm_comparables >= MIN_COMPARABLES) {
      segmentMedian = Number(r.mm_median);
      segmentSize = r.mm_comparables;
      segmentLevel = "make_model";
    } else if (r.my_comparables >= MIN_COMPARABLES) {
      segmentMedian = Number(r.my_median);
      segmentSize = r.my_comparables;
      segmentLevel = "make_year_band";
    }

    let verdict: MarketVerdict;
    let pctVsMedian: number | null = null;
    if (segmentMedian === null) {
      verdict = "INSUFFICIENT_COMPARABLES";
    } else {
      pctVsMedian = Math.round(((currentPrice - segmentMedian) / segmentMedian) * 1000) / 10;
      if (pctVsMedian <= GOOD_DEAL_THRESHOLD) verdict = "GOOD_DEAL";
      else if (pctVsMedian >= OVERPRICED_THRESHOLD) verdict = "OVERPRICED";
      else verdict = "FAIR";
    }

    return {
      listing_id: r.listing_id,
      portal_id: r.portal_id,
      portal_name: r.portal_name,
      listing_url: r.listing_url,
      title: r.title,
      make: r.make,
      model: r.model,
      year: r.year,
      city: r.city,
      odometer_km: r.odometer_km,
      main_image_url: r.main_image_url,
      is_seeded: r.is_seeded,
      current_price: r.current_price,
      segment_median: segmentMedian != null ? String(segmentMedian) : null,
      segment_size: segmentSize,
      segment_level: segmentLevel,
      pct_vs_median: pctVsMedian,
      verdict,
    } as MarketValueRow;
    })
    .sort((a, b) => VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]);
}
