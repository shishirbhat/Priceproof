import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { QueryState, ListRowSkeleton } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { Card } from "@/components/ui/card";
import { AnimatedBar } from "@/components/domain/AnimatedBar";
import { PackageCheck, PackageX } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatGap(seconds: string) {
  const s = Number(seconds);
  const days = s / 86400;
  if (days < 1) return `${Math.round(s / 3600)}h`;
  return `${days.toFixed(1)}d`;
}

export function Availability() {
  const events = useQuery({ queryKey: ["availability-events"], queryFn: api.availabilityEvents });
  const rate = useQuery({ queryKey: ["availability-rate"], queryFn: api.availabilityRate });

  const restocks = (events.data ?? []).filter((e) => e.in_stock);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// 04 AVAILABILITY"
        title="Availability & Stockouts"
        description="Live stockout/restock feed and availability rate by store and category. Restock gaps are measured to the ingest cadence — daily for seeded history, tighter once live collection runs more frequently."
      />

      <FadeIn>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">Availability rate by store &amp; category</h2>
        <QueryState
          isLoading={rate.isLoading}
          error={rate.error}
          data={rate.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No data yet"
          skeleton={<ListRowSkeleton rows={3} />}
        >
          {(rows) => (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-xs">
                    {r.store_name} <span className="text-muted-foreground capitalize">· {r.category}</span>
                  </span>
                  <AnimatedBar pct={Number(r.availability_pct)} delay={i * 60} className="bg-severity-genuine" />
                  <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {r.availability_pct}%
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
          <h2 className="text-[13px] font-semibold tracking-tight">Live stockout/restock feed</h2>
          <QueryState
            isLoading={events.isLoading}
            error={events.error}
            data={events.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No availability events yet"
            skeleton={<ListRowSkeleton rows={6} />}
          >
            {(rows) => (
              <ul className="divide-y divide-white/[0.05]">
                {rows.slice(0, 15).map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      {e.in_stock ? (
                        <PackageCheck className="h-4 w-4 shrink-0 text-severity-genuine" />
                      ) : (
                        <PackageX className="h-4 w-4 shrink-0 text-severity-violation" />
                      )}
                      <Link to={`/products/${e.product_id}`} className="transition-colors hover:text-foreground/80">
                        {e.title}
                      </Link>
                      {e.is_seeded && <SeededBadge isSeeded />}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {formatDate(e.scraped_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>

        <Card className="gap-3 p-5">
          <h2 className="text-[13px] font-semibold tracking-tight">Time to restock</h2>
          {restocks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No restock events recorded yet.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {restocks.slice(0, 15).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link to={`/products/${e.product_id}`} className="transition-colors hover:text-foreground/80">
                    {e.title}
                  </Link>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatGap(e.gap_seconds)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
