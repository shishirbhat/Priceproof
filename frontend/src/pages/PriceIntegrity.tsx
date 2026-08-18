import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, type IntegrityRow, type IntegrityVerdict } from "@/lib/api";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { QueryState, ChartSkeleton, ListRowSkeleton } from "@/components/domain/QueryState";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatCurrency(v: string | number) {
  return `$${Number(v).toFixed(2)}`;
}

const FILTERS: Array<{ key: IntegrityVerdict | "ALL"; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "INFLATED", label: "Inflated" },
  { key: "GENUINE", label: "Genuine" },
  { key: "INSUFFICIENT_HISTORY", label: "Insufficient history" },
];

function IntegrityDetail({ row }: { row: IntegrityRow }) {
  const history = useQuery({
    queryKey: ["price-integrity-history", row.store_product_id],
    queryFn: () => api.priceIntegrityHistory(row.store_product_id),
  });

  const chartData = useMemo(() => {
    if (!history.data) return [];
    return history.data.map((s) => ({
      date: new Date(s.scraped_at),
      current: Number(s.current_price),
      list: s.list_price != null ? Number(s.list_price) : undefined,
      trueLow: Number(s.true_30d_low),
    }));
  }, [history.data]);

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/products/${row.product_id}`} className="text-sm font-semibold hover:underline">
              {row.title}
            </Link>
            <SeverityBadge verdict={row.verdict} />
            {row.is_seeded && <SeededBadge isSeeded />}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{row.store_name}</div>
        </div>
        <a
          href={row.product_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View live listing →
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Selling price</div>
          <div className="font-mono text-lg tabular-nums">{formatCurrency(row.current_price)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Claimed "was" price</div>
          <div className="font-mono text-lg tabular-nums text-severity-violation">
            {formatCurrency(row.list_price)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">True 30-day low (before sale)</div>
          <div className="font-mono text-lg tabular-nums">
            {row.true_30d_low != null ? formatCurrency(row.true_30d_low) : "—"}
          </div>
        </div>
      </div>

      {row.verdict === "INFLATED" && (
        <p className="rounded-lg border border-severity-violation/30 bg-severity-violation/10 px-3 py-2 text-xs text-severity-violation">
          The advertised was-price is {row.inflation_pct}% above the true 30-day low — that price was
          never actually charged in the 30 days before this "sale" began.
        </p>
      )}
      {row.verdict === "GENUINE" && (
        <p className="rounded-lg border border-severity-genuine/30 bg-severity-genuine/10 px-3 py-2 text-xs text-severity-genuine">
          The advertised was-price closely matches the real 30-day low — this discount reflects
          actual price history.
        </p>
      )}
      {row.verdict === "INSUFFICIENT_HISTORY" && (
        <p className="rounded-lg border border-severity-drift/30 bg-severity-drift/10 px-3 py-2 text-xs text-severity-drift">
          Fewer than 30 days of price history exist before this claim — there isn't enough data to
          verify it honestly either way yet.
        </p>
      )}

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
  );
}

export function PriceIntegrity() {
  const [filter, setFilter] = useState<IntegrityVerdict | "ALL">("ALL");
  const integrity = useQuery({ queryKey: ["price-integrity"], queryFn: api.priceIntegrity });

  const filtered = useMemo(() => {
    if (!integrity.data) return [];
    if (filter === "ALL") return integrity.data;
    return integrity.data.filter((r) => r.verdict === filter);
  }, [integrity.data, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Price Integrity</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every advertised discount, checked against the true lowest price charged in the 30 days
          before the claim — the EU Omnibus / UK CMA / India CCPA standard. A verdict is only ever
          given with enough history to back it; otherwise it says so honestly.
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            className={cn("text-xs")}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {integrity.data && f.key !== "ALL" && (
              <span className="ml-1 text-muted-foreground">
                {integrity.data.filter((r) => r.verdict === f.key).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      <QueryState
        isLoading={integrity.isLoading}
        error={integrity.error}
        data={filtered}
        isEmpty={(d) => d.length === 0}
        emptyTitle="No claims match this filter"
        skeleton={<ListRowSkeleton rows={4} />}
      >
        {(rows) => (
          <div className="space-y-4">
            {rows.map((row) => (
              <IntegrityDetail key={row.snapshot_id} row={row} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
