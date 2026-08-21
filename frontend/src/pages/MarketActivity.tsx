import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { QueryState, ListRowSkeleton } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { Panel, PanelRow } from "@/components/domain/Panel";
import { AnimatedBar } from "@/components/domain/AnimatedBar";
import { PackageX, Clock } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDays(seconds: string | number) {
  const days = Number(seconds) / 86400;
  if (days < 1) return `${Math.round(Number(seconds) / 3600)}h`;
  return `${days.toFixed(1)}d`;
}

export function MarketActivity() {
  const events = useQuery({ queryKey: ["delisting-events"], queryFn: api.delistingEvents });
  const daysOnMarket = useQuery({ queryKey: ["days-on-market"], queryFn: api.daysOnMarket });
  const activeLongest = useQuery({ queryKey: ["active-longest"], queryFn: api.activeLongest });

  const maxAvg = Math.max(1, ...(daysOnMarket.data ?? []).map((r) => Number(r.avg_days_on_market)));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Days on market"
        index="04"
        title="Market Activity"
        description="A listing disappearing between two collection runs is the only sold/removed signal a search-results collector gives — days-on-market is derived from that, bounded by scrape cadence, not read off a 'days ago' label."
      />

      <Panel index="01" title="Average days-on-market by make">
        <QueryState
          isLoading={daysOnMarket.isLoading}
          error={daysOnMarket.error}
          data={daysOnMarket.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No sold/delisted listings yet"
          skeleton={<ListRowSkeleton rows={3} />}
        >
          {(rows) => (
            <div className="space-y-3.5">
              {rows.map((r, i) => (
                <div key={r.make} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 truncate">
                    <span className="text-[12.5px] text-label-1">{r.make}</span>
                    <span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-label-3 tabular-nums">
                      {r.sold_count} SOLD
                    </span>
                  </span>
                  <AnimatedBar
                    pct={(Number(r.avg_days_on_market) / maxAvg) * 100}
                    delay={i * 60}
                    className="bg-severity-drift"
                  />
                  <span className="w-16 shrink-0 text-right font-mono text-[11px] tabular-nums text-label-2">
                    {r.avg_days_on_market}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </QueryState>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel index="02" title="Delisting feed" delay={0.05} bodyClassName="px-5 py-0">
          <QueryState
            isLoading={events.isLoading}
            error={events.error}
            data={events.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No delisting events yet"
            skeleton={<div className="py-4"><ListRowSkeleton rows={6} /></div>}
          >
            {(rows) => (
              <ul>
                {rows.slice(0, 15).map((e) => (
                  <PanelRow key={e.listing_id}>
                    <div className="flex min-w-0 items-center gap-3">
                      <PackageX className="h-3.5 w-3.5 shrink-0 text-severity-violation" />
                      <Link
                        to={`/listings/${e.listing_id}`}
                        className="truncate text-[13px] tracking-[-0.01em] text-label-1 transition-colors duration-200 hover:text-brand"
                      >
                        {e.title}
                      </Link>
                      {e.is_seeded && <SeededBadge isSeeded />}
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-label-3 tabular-nums">
                      {formatDate(e.delisted_at)}
                    </span>
                  </PanelRow>
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>

        <Panel
          index="03"
          title="Aging inventory · still active"
          delay={0.1}
          bodyClassName="px-5 py-0"
        >
          <QueryState
            isLoading={activeLongest.isLoading}
            error={activeLongest.error}
            data={activeLongest.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No active listings recorded yet"
            skeleton={<div className="py-4"><ListRowSkeleton rows={6} /></div>}
          >
            {(rows) => (
              <ul>
                {rows.slice(0, 15).map((e) => (
                  <PanelRow key={e.listing_id}>
                    <div className="flex min-w-0 items-center gap-3">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-label-3" />
                      <Link
                        to={`/listings/${e.listing_id}`}
                        className="truncate text-[13px] tracking-[-0.01em] text-label-1 transition-colors duration-200 hover:text-brand"
                      >
                        {e.title}
                      </Link>
                      {e.is_seeded && <SeededBadge isSeeded />}
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-label-3">
                      {formatDays(e.days_active_seconds)} and counting
                    </span>
                  </PanelRow>
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>
      </div>
    </div>
  );
}
