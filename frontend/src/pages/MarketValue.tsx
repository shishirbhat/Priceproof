import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, type MarketValueRow, type MarketVerdict } from "@/lib/api";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { QueryState, ChartSkeleton, ListRowSkeleton } from "@/components/domain/QueryState";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { AnimatedNumber } from "@/components/domain/AnimatedNumber";
import { formatCurrency } from "@/lib/format";
import { motion, useInView } from "motion/react";
import { DUR, EASE_EXPO, REVEAL_VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingDown, Minus, TrendingUp, HelpCircle } from "lucide-react";

const FILTERS: Array<{ key: MarketVerdict | "ALL"; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "GOOD_DEAL", label: "Good deal" },
  { key: "FAIR", label: "Fair price" },
  { key: "OVERPRICED", label: "Overpriced" },
  { key: "INSUFFICIENT_COMPARABLES", label: "Insufficient comparables" },
];

const VERDICT_NOTE: Record<
  MarketVerdict,
  { icon: typeof TrendingDown; className: string; text: (r: MarketValueRow) => string }
> = {
  GOOD_DEAL: {
    icon: TrendingDown,
    className: "bg-severity-genuine/[0.07] text-severity-genuine shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--severity-genuine)_28%,transparent)]",
    text: (r) =>
      `Priced ${Math.abs(r.pct_vs_median!)}% below the median of ${r.segment_size} comparable ${r.make} ${r.model} listings — a genuinely underpriced comparable, not a rounding artifact.`,
  },
  FAIR: {
    icon: Minus,
    className: "bg-surface-2 text-label-2 shadow-[inset_0_0_0_1px_var(--hairline-strong)]",
    text: (r) =>
      `Within ${Math.abs(r.pct_vs_median!)}% of the median of ${r.segment_size} comparable ${r.make} ${r.model} listings — priced in line with the market.`,
  },
  OVERPRICED: {
    icon: TrendingUp,
    className: "bg-severity-violation/[0.07] text-severity-violation shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--severity-violation)_28%,transparent)]",
    text: (r) =>
      `Priced ${r.pct_vs_median}% above the median of ${r.segment_size} comparable ${r.make} ${r.model} listings.`,
  },
  INSUFFICIENT_COMPARABLES: {
    icon: HelpCircle,
    className: "bg-severity-drift/[0.07] text-severity-drift shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--severity-drift)_28%,transparent)]",
    text: () =>
      `Fewer than the required comparable listings exist for this make/model (or make/year) — there isn't enough data to score this listing against the market honestly yet.`,
  },
};

function MarketValueDetail({ row, delay }: { row: MarketValueRow; delay: number }) {
  const cardRef = useRef<HTMLElement>(null);

  // This page renders one card per scored listing, and every card used to
  // mount a full animated chart and fire its own history request the moment
  // the page loaded. With the seeded catalogue that is 17 simultaneous
  // requests and 17 visx charts, each with its own animation hooks — enough
  // to bog down a laptop on a page where most cards are below the fold. Both
  // the fetch and the chart now wait until the card is actually near the
  // viewport, and `once` keeps it mounted after that so scrolling back up
  // does not re-fetch.
  const inView = useInView(cardRef, { once: true, margin: "300px 0px" });

  const history = useQuery({
    queryKey: ["market-value-history", row.listing_id],
    queryFn: () => api.marketValueHistory(row.listing_id),
    enabled: inView,
  });

  const chartData = useMemo(() => {
    if (!history.data) return [];
    return history.data.map((s) => ({
      date: new Date(s.scraped_at),
      current: Number(s.current_price),
      list: s.original_price != null ? Number(s.original_price) : undefined,
      trueLow: row.segment_median != null ? Number(row.segment_median) : undefined,
    }));
  }, [history.data, row.segment_median]);

  const note = VERDICT_NOTE[row.verdict];
  const NoteIcon = note.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
      ref={cardRef}
      className="panel rounded-lg"
    >
      <header className="relative flex items-start justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/listings/${row.listing_id}`}
              className="display-4 text-label-1 transition-colors duration-200 hover:text-brand"
            >
              {row.title}
            </Link>
            <SeverityBadge verdict={row.verdict} />
            {row.is_seeded && <SeededBadge isSeeded />}
          </div>
          <div className="label-mono mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{row.portal_name}</span>
            {row.city && <span className="text-label-4">/ {row.city}</span>}
            {row.odometer_km != null && (
              <span className="text-label-4">/ {row.odometer_km.toLocaleString("en-IN")} km</span>
            )}
          </div>
        </div>
        <a
          href={row.listing_url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex shrink-0 items-center gap-1.5"
        >
          <span className="label-mono-sm transition-colors duration-200 group-hover:text-label-1">
            Live listing
          </span>
          <ArrowUpRight className="h-3 w-3 text-label-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
        </a>
        <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--hairline)]" />
      </header>

      {/* The scoring plate: the three figures the verdict is derived from,
          separated by hairlines so they read as one instrument. */}
      <div className="grid grid-cols-3 gap-px bg-[var(--hairline)]">
        <div className="bg-surface-1 px-6 py-4">
          <div className="label-mono">Asking price</div>
          <div className="mt-2 text-[1.75rem] leading-none font-light tracking-[-0.04em] tabular-nums text-label-1">
            <AnimatedNumber value={Number(row.current_price)} format={formatCurrency} />
          </div>
        </div>
        <div className="bg-surface-1 px-6 py-4">
          <div className="label-mono">Segment median</div>
          <div className="mt-2 text-[1.75rem] leading-none font-light tracking-[-0.04em] tabular-nums text-label-2">
            {row.segment_median != null ? (
              <AnimatedNumber value={Number(row.segment_median)} format={formatCurrency} />
            ) : (
              "—"
            )}
          </div>
        </div>
        <div className="bg-surface-1 px-6 py-4">
          <div className="label-mono">Comparables</div>
          <div className="mt-2 text-[1.75rem] leading-none font-light tracking-[-0.04em] tabular-nums text-label-2">
            {row.segment_size}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5">
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg px-4 py-3.5 text-[13px] leading-[1.6]",
            note.className,
          )}
        >
          <NoteIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{note.text(row)}</span>
        </div>

        {!inView ? (
          <ChartSkeleton />
        ) : (
        <QueryState
          isLoading={history.isLoading}
          error={history.error}
          data={history.data}
          skeleton={<ChartSkeleton />}
        >
          {() =>
            chartData.length > 1 ? (
              <PriceHistoryChart data={chartData} />
            ) : (
              <div className="label-mono rounded-lg border border-dashed border-[var(--hairline-strong)] p-8 text-center">
                Not enough snapshots yet to chart
              </div>
            )
          }
        </QueryState>
        )}
      </div>
    </motion.article>
  );
}

export function MarketValue() {
  const [filter, setFilter] = useState<MarketVerdict | "ALL">("ALL");
  const marketValue = useQuery({ queryKey: ["market-value"], queryFn: api.marketValue });

  const filtered = useMemo(() => {
    if (!marketValue.data) return [];
    if (filter === "ALL") return marketValue.data;
    return marketValue.data.filter((r) => r.verdict === filter);
  }, [marketValue.data, filter]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pricing intelligence"
        index="02"
        title="Market Value"
        description="Every active listing scored against the median of comparable listings — same make and model, or make and model-year when a model line is too thin. A verdict is only ever given with enough comparables to back it; otherwise it says so honestly."
      />

      {/* Verdict filter, as a segmented readout rather than a row of
          buttons — each segment carries its own count, so the distribution
          of verdicts is visible without applying a filter. */}
      <div className="flex flex-wrap gap-px overflow-hidden rounded-lg bg-[var(--hairline)]">
        {FILTERS.map((f) => {
          const count =
            f.key === "ALL"
              ? marketValue.data?.length
              : marketValue.data?.filter((r) => r.verdict === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className={cn(
                "group relative flex items-baseline gap-2 px-4 py-3 transition-colors duration-200",
                active
                  ? "bg-surface-3 text-label-1"
                  : "bg-surface-1 text-label-3 hover:bg-surface-2 hover:text-label-2",
              )}
            >
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase">{f.label}</span>
              {count !== undefined && (
                <span className="font-mono text-[11px] tabular-nums text-label-4">{count}</span>
              )}
              {active && (
                <motion.span
                  layoutId="verdict-filter-active"
                  className="absolute inset-x-0 bottom-0 h-px bg-brand"
                  transition={{ duration: DUR.micro, ease: EASE_EXPO }}
                />
              )}
            </button>
          );
        })}
      </div>

      <QueryState
        isLoading={marketValue.isLoading}
        error={marketValue.error}
        data={filtered}
        isEmpty={(d) => d.length === 0}
        emptyTitle="No listings match this filter"
        skeleton={<ListRowSkeleton rows={4} />}
      >
        {(rows) => (
          <div className="space-y-4">
            {rows.map((row, i) => (
              <MarketValueDetail key={row.listing_id} row={row} delay={i * 0.06} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
