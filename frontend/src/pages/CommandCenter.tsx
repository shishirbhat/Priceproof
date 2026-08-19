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
import { Car, Globe2, TrendingUp, PackageX, GitCompareArrows, ShieldX } from "lucide-react";

function formatCurrency(v: string | number) {
  return `₹${Number(v).toLocaleString("en-IN")}`;
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
  const marketValue = useQuery({ queryKey: ["market-value"], queryFn: api.marketValue });
  const crossPortal = useQuery({ queryKey: ["cross-portal"], queryFn: api.crossPortalMatches });
  const delistings = useQuery({ queryKey: ["delisting-events"], queryFn: api.delistingEvents });

  const notableDeals = (marketValue.data ?? []).filter(
    (r) => r.verdict === "GOOD_DEAL" || r.verdict === "OVERPRICED",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="// 01 COMMAND CENTER"
        title="Command Center"
        description="Live read on market value, days-on-market, and cross-portal price gaps across every tracked listings portal."
      />

      <QueryState
        isLoading={kpis.isLoading}
        error={kpis.error}
        data={kpis.data}
        skeleton={<TileGridSkeleton />}
      >
        {(data) => (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Listings tracked" value={data.listings_tracked} icon={<Car className="h-3.5 w-3.5" />} delay={0} />
            <StatTile label="Portals" value={data.portals} icon={<Globe2 className="h-3.5 w-3.5" />} delay={0.04} />
            <StatTile
              label="Price changes (24h)"
              value={data.price_changes_24h}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              delay={0.08}
            />
            <StatTile
              label="Newly delisted (24h)"
              value={data.newly_delisted_24h}
              icon={<PackageX className="h-3.5 w-3.5" />}
              tone={data.newly_delisted_24h > 0 ? "drift" : "neutral"}
              delay={0.12}
            />
            <StatTile
              label="Cross-portal matches"
              value={data.cross_portal_matches}
              icon={<GitCompareArrows className="h-3.5 w-3.5" />}
              tone={data.cross_portal_matches > 0 ? "drift" : "neutral"}
              delay={0.16}
            />
            <StatTile
              label="Overpriced listings"
              value={data.overpriced_count}
              icon={<ShieldX className="h-3.5 w-3.5" />}
              tone={data.overpriced_count > 0 ? "violation" : "neutral"}
              delay={0.2}
            />
          </div>
        )}
      </QueryState>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold tracking-tight">Notable market-value calls</h2>
              <Link
                to="/market-value"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <QueryState
              isLoading={marketValue.isLoading}
              error={marketValue.error}
              data={notableDeals}
              isEmpty={(d) => d.length === 0}
              emptyTitle="No good-deal or overpriced calls right now"
              emptyDescription="Every active listing with enough comparables is currently priced fairly."
              skeleton={<ListRowSkeleton rows={5} />}
            >
              {(rows) => (
                <ul className="divide-y divide-white/[0.05]">
                  {rows.slice(0, 5).map((r) => (
                    <li
                      key={r.listing_id}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/listings/${r.listing_id}`}
                          className="truncate text-sm font-medium transition-colors hover:text-foreground/80"
                        >
                          {r.title}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">
                          {formatCurrency(r.current_price)}
                          {r.segment_median && (
                            <span className="text-muted-foreground/70"> · median {formatCurrency(r.segment_median)}</span>
                          )}
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
              <h2 className="text-[13px] font-semibold tracking-tight">Cross-portal matches</h2>
              <Link
                to="/cross-portal"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <QueryState
              isLoading={crossPortal.isLoading}
              error={crossPortal.error}
              data={crossPortal.data}
              isEmpty={(d) => d.length === 0}
              emptyTitle="No cross-portal duplicates found yet"
              emptyDescription="No listing has been matched to the same car on a different portal."
              skeleton={<ListRowSkeleton rows={5} />}
            >
              {(rows) => (
                <ul className="divide-y divide-white/[0.05]">
                  {rows.slice(0, 5).map((r) => (
                    <li
                      key={r.listing_id}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{r.listing_title}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {r.portal_name} {formatCurrency(r.current_price)} vs {r.matched_portal_name}{" "}
                          {formatCurrency(r.matched_price)}
                          {r.is_seeded && <SeededBadge isSeeded className="ml-2" />}
                        </div>
                      </div>
                      <span className="rounded-full border border-severity-drift/25 bg-severity-drift/10 px-2 py-0.5 text-xs font-medium text-severity-drift">
                        {r.pct_price_gap}% gap
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
            isLoading={delistings.isLoading}
            error={delistings.error}
            data={delistings.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No delisting events yet"
            skeleton={<ListRowSkeleton rows={8} />}
          >
            {(rows) => (
              <ul className="divide-y divide-white/[0.05]">
                {rows.slice(0, 8).map((r) => (
                  <li
                    key={r.listing_id}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-severity-drift shadow-[0_0_6px_1px] shadow-severity-drift/50" />
                      <span className="font-medium">{r.title}</span>
                      <span className="text-muted-foreground">
                        delisted at {r.portal_name} after {Math.round(Number(r.days_on_market_seconds) / 86400)}d on market
                      </span>
                      {r.is_seeded && <SeededBadge isSeeded />}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {timeAgo(r.delisted_at)}
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
