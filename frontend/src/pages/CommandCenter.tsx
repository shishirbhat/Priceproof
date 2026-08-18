import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { StatTile } from "@/components/domain/StatTile";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { QueryState, ListRowSkeleton, TileGridSkeleton } from "@/components/domain/QueryState";
import { Card } from "@/components/ui/card";

function formatCurrency(v: string | number) {
  return `$${Number(v).toFixed(2)}`;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CommandCenter() {
  const kpis = useQuery({ queryKey: ["kpis"], queryFn: api.kpis });
  const integrity = useQuery({ queryKey: ["price-integrity"], queryFn: api.priceIntegrity });
  const violations = useQuery({ queryKey: ["map-violations"], queryFn: api.mapViolations });
  const availability = useQuery({ queryKey: ["availability-events"], queryFn: api.availabilityEvents });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground">
          Live read on price integrity, availability, and compliance across every tracked store.
        </p>
      </div>

      <QueryState
        isLoading={kpis.isLoading}
        error={kpis.error}
        data={kpis.data}
        skeleton={<TileGridSkeleton />}
      >
        {(data) => (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatTile label="SKUs tracked" value={data.skus_tracked} />
            <StatTile label="Stores" value={data.stores} />
            <StatTile label="Price changes (24h)" value={data.price_changes_24h} />
            <StatTile
              label="Active stockouts"
              value={data.active_stockouts}
              tone={data.active_stockouts > 0 ? "drift" : "neutral"}
            />
            <StatTile
              label="Open MAP violations"
              value={data.open_map_violations}
              tone={data.open_map_violations > 0 ? "violation" : "neutral"}
            />
            <StatTile
              label="Discount-integrity failures"
              value={data.discount_integrity_failures}
              tone={data.discount_integrity_failures > 0 ? "violation" : "neutral"}
            />
          </div>
        )}
      </QueryState>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Discount integrity claims</h2>
            <Link to="/price-integrity" className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <QueryState
            isLoading={integrity.isLoading}
            error={integrity.error}
            data={integrity.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No active discount claims"
            emptyDescription="Nothing in the catalog is currently advertising a markdown."
            skeleton={<ListRowSkeleton rows={5} />}
          >
            {(rows) => (
              <ul className="divide-y divide-border">
                {rows.slice(0, 5).map((r) => (
                  <li key={r.snapshot_id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${r.product_id}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {r.title}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">
                        {formatCurrency(r.current_price)}{" "}
                        <span className="line-through">{formatCurrency(r.list_price)}</span>
                        {r.is_seeded && <SeededBadge isSeeded className="ml-2" />}
                      </div>
                    </div>
                    <SeverityBadge verdict={r.verdict} />
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>

        <Card className="gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">MAP violations</h2>
            <Link to="/map-violations" className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <QueryState
            isLoading={violations.isLoading}
            error={violations.error}
            data={violations.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No open MAP violations"
            emptyDescription="Every tracked product is currently priced at or above its MAP floor."
            skeleton={<ListRowSkeleton rows={5} />}
          >
            {(rows) => (
              <ul className="divide-y divide-border">
                {rows.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {formatCurrency(r.current_price)} vs floor {formatCurrency(r.floor_price)}
                        {r.is_seeded && <SeededBadge isSeeded className="ml-2" />}
                      </div>
                    </div>
                    <span className="rounded-full border border-severity-violation/30 bg-severity-violation/15 px-2 py-0.5 text-xs font-medium text-severity-violation">
                      {r.pct_below_floor}% below
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>
      </div>

      <Card className="gap-3 p-5">
        <h2 className="text-sm font-medium">Recent activity</h2>
        <QueryState
          isLoading={availability.isLoading}
          error={availability.error}
          data={availability.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No availability events yet"
          skeleton={<ListRowSkeleton rows={8} />}
        >
          {(rows) => (
            <ul className="divide-y divide-border">
              {rows.slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        r.in_stock
                          ? "h-1.5 w-1.5 rounded-full bg-severity-genuine"
                          : "h-1.5 w-1.5 rounded-full bg-severity-violation"
                      }
                    />
                    <span className="font-medium">{r.title}</span>
                    <span className="text-muted-foreground">
                      {r.in_stock ? "restocked" : "went out of stock"} at {r.store_name}
                    </span>
                    {r.is_seeded && <SeededBadge isSeeded />}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {timeAgo(r.scraped_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </Card>
    </div>
  );
}
