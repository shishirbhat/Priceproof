import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { StatTile } from "@/components/domain/StatTile";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { QueryState, ListRowSkeleton, TileGridSkeleton } from "@/components/domain/QueryState";
import { Card } from "@/components/ui/card";
import { Package, Store, TrendingUp, PackageX, ShieldAlert, ShieldX } from "lucide-react";

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
      <PageHeader
        eyebrow="// 01 COMMAND CENTER"
        title="Command Center"
        description="Live read on price integrity, availability, and compliance across every tracked store."
      />

      <QueryState
        isLoading={kpis.isLoading}
        error={kpis.error}
        data={kpis.data}
        skeleton={<TileGridSkeleton />}
      >
        {(data) => (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatTile label="SKUs tracked" value={data.skus_tracked} icon={<Package className="h-3.5 w-3.5" />} delay={0} />
            <StatTile label="Stores" value={data.stores} icon={<Store className="h-3.5 w-3.5" />} delay={0.04} />
            <StatTile
              label="Price changes (24h)"
              value={data.price_changes_24h}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              delay={0.08}
            />
            <StatTile
              label="Active stockouts"
              value={data.active_stockouts}
              icon={<PackageX className="h-3.5 w-3.5" />}
              tone={data.active_stockouts > 0 ? "drift" : "neutral"}
              delay={0.12}
            />
            <StatTile
              label="Open MAP violations"
              value={data.open_map_violations}
              icon={<ShieldAlert className="h-3.5 w-3.5" />}
              tone={data.open_map_violations > 0 ? "violation" : "neutral"}
              delay={0.16}
            />
            <StatTile
              label="Discount-integrity failures"
              value={data.discount_integrity_failures}
              icon={<ShieldX className="h-3.5 w-3.5" />}
              tone={data.discount_integrity_failures > 0 ? "violation" : "neutral"}
              delay={0.2}
            />
          </div>
        )}
      </QueryState>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold tracking-tight">Discount integrity claims</h2>
              <Link
                to="/price-integrity"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
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
                <ul className="divide-y divide-white/[0.05]">
                  {rows.slice(0, 5).map((r) => (
                    <li
                      key={r.snapshot_id}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/products/${r.product_id}`}
                          className="truncate text-sm font-medium transition-colors hover:text-foreground/80"
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
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold tracking-tight">MAP violations</h2>
              <Link
                to="/map-violations"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
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
                <ul className="divide-y divide-white/[0.05]">
                  {rows.slice(0, 5).map((r) => (
                    <li
                      key={r.id}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{r.title}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {formatCurrency(r.current_price)} vs floor {formatCurrency(r.floor_price)}
                          {r.is_seeded && <SeededBadge isSeeded className="ml-2" />}
                        </div>
                      </div>
                      <span className="rounded-full border border-severity-violation/25 bg-severity-violation/10 px-2 py-0.5 text-xs font-medium text-severity-violation">
                        {r.pct_below_floor}% below
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </QueryState>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <Card className="gap-3 p-5">
          <h2 className="text-[13px] font-semibold tracking-tight">Recent activity</h2>
          <QueryState
            isLoading={availability.isLoading}
            error={availability.error}
            data={availability.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No availability events yet"
            skeleton={<ListRowSkeleton rows={8} />}
          >
            {(rows) => (
              <ul className="divide-y divide-white/[0.05]">
                {rows.slice(0, 8).map((r) => (
                  <li
                    key={r.id}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={
                          r.in_stock
                            ? "h-1.5 w-1.5 shrink-0 rounded-full bg-severity-genuine shadow-[0_0_6px_1px] shadow-severity-genuine/50"
                            : "h-1.5 w-1.5 shrink-0 rounded-full bg-severity-violation shadow-[0_0_6px_1px] shadow-severity-violation/50"
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
      </FadeIn>
    </div>
  );
}
