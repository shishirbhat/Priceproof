import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { QueryState, ListRowSkeleton } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Days on market"
        title="Market Activity"
        description="A listing disappearing between two collection runs is the only sold/removed signal a search-results collector gives — days-on-market is derived from that, bounded by scrape cadence, not read off a 'days ago' label."
      />

      <FadeIn>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">Average days-on-market by make</h2>
        <QueryState
          isLoading={daysOnMarket.isLoading}
          error={daysOnMarket.error}
          data={daysOnMarket.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No sold/delisted listings yet"
          skeleton={<ListRowSkeleton rows={3} />}
        >
          {(rows) => (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={r.make} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs">
                    {r.make} <span className="text-muted-foreground">· {r.sold_count} sold</span>
                  </span>
                  <AnimatedBar
                    pct={(Number(r.avg_days_on_market) / maxAvg) * 100}
                    delay={i * 60}
                    className="bg-severity-drift"
                  />
                  <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {r.avg_days_on_market}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </QueryState>
      </Card>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="gap-3 p-5">
          <h2 className="text-[13px] font-semibold tracking-tight">Delisting feed</h2>
          <QueryState
            isLoading={events.isLoading}
            error={events.error}
            data={events.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No delisting events yet"
            skeleton={<ListRowSkeleton rows={6} />}
          >
            {(rows) => (
              <ul className="divide-y divide-white/[0.05]">
                {rows.slice(0, 15).map((e) => (
                  <li key={e.listing_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <PackageX className="h-4 w-4 shrink-0 text-severity-violation" />
                      <Link to={`/listings/${e.listing_id}`} className="transition-colors hover:text-foreground/80">
                        {e.title}
                      </Link>
                      {e.is_seeded && <SeededBadge isSeeded />}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {formatDate(e.delisted_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>

        <Card className="gap-3 p-5">
          <h2 className="text-[13px] font-semibold tracking-tight">Aging inventory (still active)</h2>
          <QueryState
            isLoading={activeLongest.isLoading}
            error={activeLongest.error}
            data={activeLongest.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No active listings recorded yet"
            skeleton={<ListRowSkeleton rows={6} />}
          >
            {(rows) => (
              <ul className="divide-y divide-white/[0.05]">
                {rows.slice(0, 15).map((e) => (
                  <li key={e.listing_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Link to={`/listings/${e.listing_id}`} className="transition-colors hover:text-foreground/80">
                        {e.title}
                      </Link>
                      {e.is_seeded && <SeededBadge isSeeded />}
                    </div>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatDays(e.days_active_seconds)} and counting
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>
      </div>
    </div>
  );
}
