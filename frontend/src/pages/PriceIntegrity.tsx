import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, type IntegrityRow, type IntegrityVerdict } from "@/lib/api";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { QueryState, ChartSkeleton, ListRowSkeleton } from "@/components/domain/QueryState";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ShieldCheck, ShieldX, ShieldQuestion } from "lucide-react";

function formatCurrency(v: string | number) {
  return `$${Number(v).toFixed(2)}`;
}

const FILTERS: Array<{ key: IntegrityVerdict | "ALL"; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "INFLATED", label: "Inflated" },
  { key: "GENUINE", label: "Genuine" },
  { key: "INSUFFICIENT_HISTORY", label: "Insufficient history" },
];

const VERDICT_NOTE: Record<IntegrityVerdict, { icon: typeof ShieldX; className: string; text: (r: IntegrityRow) => string }> = {
  INFLATED: {
    icon: ShieldX,
    className: "border-severity-violation/25 bg-severity-violation/[0.07] text-severity-violation",
    text: (r) =>
      `The advertised was-price is ${r.inflation_pct}% above the true 30-day low — that price was never actually charged in the 30 days before this "sale" began.`,
  },
  GENUINE: {
    icon: ShieldCheck,
    className: "border-severity-genuine/25 bg-severity-genuine/[0.07] text-severity-genuine",
    text: () =>
      `The advertised was-price closely matches the real 30-day low — this discount reflects actual price history.`,
  },
  INSUFFICIENT_HISTORY: {
    icon: ShieldQuestion,
    className: "border-severity-drift/25 bg-severity-drift/[0.07] text-severity-drift",
    text: () =>
      `Fewer than 30 days of price history exist before this claim — there isn't enough data to verify it honestly either way yet.`,
  },
};

function IntegrityDetail({ row, delay }: { row: IntegrityRow; delay: number }) {
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

  const note = VERDICT_NOTE[row.verdict];
  const NoteIcon = note.icon;

  return (
    <FadeIn delay={delay}>
      <Card className="gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Link
                to={`/products/${row.product_id}`}
                className="text-base font-semibold tracking-tight transition-colors hover:text-foreground/80"
              >
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
            className="group inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View live listing
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-lg border border-white/[0.06] bg-black/20">
          <div className="px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Selling price
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {formatCurrency(row.current_price)}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Claimed "was" price
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-severity-violation">
              {formatCurrency(row.list_price)}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              True 30-day low
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {row.true_30d_low != null ? formatCurrency(row.true_30d_low) : "—"}
            </div>
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
      <PageHeader
        title="Price Integrity"
        description="Every advertised discount, checked against the true lowest price charged in the 30 days before the claim — the EU Omnibus / UK CMA / India CCPA standard. A verdict is only ever given with enough history to back it; otherwise it says so honestly."
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            className="text-xs"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {integrity.data && f.key !== "ALL" && (
              <span className="ml-1 opacity-70">
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
            {rows.map((row, i) => (
              <IntegrityDetail key={row.snapshot_id} row={row} delay={i * 0.06} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
