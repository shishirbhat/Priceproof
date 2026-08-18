import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { QueryState, ListRowSkeleton } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { Card } from "@/components/ui/card";

function formatCurrency(v: string | number) {
  return `$${Number(v).toFixed(2)}`;
}

export function MapViolations() {
  const violations = useQuery({ queryKey: ["map-violations"], queryFn: api.mapViolations });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// 05 MAP VIOLATIONS"
        title="MAP Violations"
        description="Products currently priced below their brand-set Minimum Advertised Price floor, ranked by how far below floor they are."
      />

      <QueryState
        isLoading={violations.isLoading}
        error={violations.error}
        data={violations.data}
        isEmpty={(d) => d.length === 0}
        emptyTitle="No open MAP violations"
        emptyDescription="Every tracked product with a MAP policy is currently priced at or above its floor."
        skeleton={<ListRowSkeleton rows={4} />}
      >
        {(rows) => (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <FadeIn key={r.id} delay={i * 0.05}>
                <Card className="flex-row items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    {r.image_url && (
                      <img
                        src={r.image_url}
                        alt=""
                        className="h-11 w-11 rounded-lg border border-white/[0.08] object-cover"
                      />
                    )}
                    <div>
                      <Link
                        to={`/products/${r.product_id}`}
                        className="text-sm font-medium transition-colors hover:text-foreground/80"
                      >
                        {r.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {r.store_name}
                        {r.is_seeded && <SeededBadge isSeeded className="ml-2" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Current</div>
                      <div className="font-mono text-sm tabular-nums">{formatCurrency(r.current_price)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Floor</div>
                      <div className="font-mono text-sm tabular-nums">{formatCurrency(r.floor_price)}</div>
                    </div>
                    <span className="rounded-full border border-severity-violation/25 bg-severity-violation/10 px-2.5 py-1 text-xs font-medium text-severity-violation shadow-[0_0_12px_-4px] shadow-severity-violation/40">
                      {r.pct_below_floor}% below
                    </span>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
