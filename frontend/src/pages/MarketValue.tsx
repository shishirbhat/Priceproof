import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, type MarketValueRow, type MarketVerdict } from "@/lib/api";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { QueryState, ChartSkeleton, ListRowSkeleton } from "@/components/domain/QueryState";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { AnimatedNumber } from "@/components/domain/AnimatedNumber";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingDown, Minus, TrendingUp, HelpCircle } from "lucide-react";

const currencyFmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

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
    className: "border-severity-genuine/25 bg-severity-genuine/[0.07] text-severity-genuine",
    text: (r) =>
      `Priced ${Math.abs(r.pct_vs_median!)}% below the median of ${r.segment_size} comparable ${r.make} ${r.model} listings — a genuinely underpriced comparable, not a rounding artifact.`,
  },
  FAIR: {
    icon: Minus,
    className: "border-white/[0.1] bg-white/[0.03] text-foreground",
    text: (r) =>
      `Within ${Math.abs(r.pct_vs_median!)}% of the median of ${r.segment_size} comparable ${r.make} ${r.model} listings — priced in line with the market.`,
  },
  OVERPRICED: {
    icon: TrendingUp,
    className: "border-severity-violation/25 bg-severity-violation/[0.07] text-severity-violation",
    text: (r) =>
      `Priced ${r.pct_vs_median}% above the median of ${r.segment_size} comparable ${r.make} ${r.model} listings.`,
  },
  INSUFFICIENT_COMPARABLES: {
    icon: HelpCircle,
    className: "border-severity-drift/25 bg-severity-drift/[0.07] text-severity-drift",
    text: () =>
      `Fewer than the required comparable listings exist for this make/model (or make/year) — there isn't enough data to score this listing against the market honestly yet.`,
  },
};

function MarketValueDetail({ row, delay }: { row: MarketValueRow; delay: number }) {
  const history = useQuery({
    queryKey: ["market-value-history", row.listing_id],
    queryFn: () => api.marketValueHistory(row.listing_id),
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
    <FadeIn delay={delay}>
      <Card className="gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Link
                to={`/listings/${row.listing_id}`}
                className="text-base font-semibold tracking-tight transition-colors hover:text-foreground/80"
              >
                {row.title}
              </Link>
              <SeverityBadge verdict={row.verdict} />
              {row.is_seeded && <SeededBadge isSeeded />}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {row.portal_name}
              {row.city && ` · ${row.city}`}
              {row.odometer_km != null && ` · ${row.odometer_km.toLocaleString("en-IN")} km`}
            </div>
          </div>
          <a
            href={row.listing_url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View live listing
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-lg border border-white/[0.06] bg-black/20">
          <div className="px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Asking price
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              <AnimatedNumber value={Number(row.current_price)} format={currencyFmt} />
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Segment median
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {row.segment_median != null ? (
                <AnimatedNumber value={Number(row.segment_median)} format={currencyFmt} />
              ) : (
                "—"
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Comparable listings
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{row.segment_size}</div>
          </div>
        </div>

        <div className={cn("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-relaxed", note.className)}>
          <NoteIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{note.text(row)}</span>
        </div>

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
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Not enough snapshots yet to chart.
              </div>
            )
          }
        </QueryState>
      </Card>
    </FadeIn>
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="// 02 MARKET VALUE"
        title="Market Value"
        description="Every active listing scored against the median of comparable listings — same make and model, or make and model-year when a model line is too thin. A verdict is only ever given with enough comparables to back it; otherwise it says so honestly."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            className="text-xs"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {marketValue.data && f.key !== "ALL" && (
              <span className="ml-1 opacity-70">
                {marketValue.data.filter((r) => r.verdict === f.key).length}
              </span>
            )}
          </Button>
        ))}
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
