import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatCurrency, timeAgo, secondsToDays } from "@/lib/format";
import { StatTile } from "@/components/domain/StatTile";
import { SeverityBadge } from "@/components/domain/SeverityBadge";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { Panel, PanelRow } from "@/components/domain/Panel";
import { QueryState, ListRowSkeleton, TileGridSkeleton } from "@/components/domain/QueryState";
import { Car, Globe2, TrendingUp, PackageX, GitCompareArrows, ShieldX } from "lucide-react";

export function CommandCenter() {
  const kpis = useQuery({ queryKey: ["kpis"], queryFn: api.kpis });
  const marketValue = useQuery({ queryKey: ["market-value"], queryFn: api.marketValue });
  const crossPortal = useQuery({ queryKey: ["cross-portal"], queryFn: api.crossPortalMatches });
  const delistings = useQuery({ queryKey: ["delisting-events"], queryFn: api.delistingEvents });

  const notableDeals = (marketValue.data ?? []).filter(
    (r) => r.verdict === "GOOD_DEAL" || r.verdict === "OVERPRICED",
  );

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Overview"
        index="01"
        title="Command Center"
        description="Live read on market value, days-on-market, and cross-portal price gaps across every tracked listings portal."
      />

      {/* Bento, not a uniform strip. The two figures that carry a verdict get
          double width and a tone; the rest are quiet. Six identical plates in
          a row is a spreadsheet header — the point of a command centre is that
          your eye lands on the thing that needs attention. */}
      <QueryState
        isLoading={kpis.isLoading}
        error={kpis.error}
        data={kpis.data}
        skeleton={<TileGridSkeleton tiles={6} />}
      >
        {(data) => (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Listings tracked"
              value={data.listings_tracked}
              unit="live"
              icon={<Car className="h-4 w-4" />}
              tone="hot"
              className="lg:col-span-2"
              hint="Every active listing across every connected portal."
              delay={0}
            />
            <StatTile
              label="Overpriced"
              value={data.overpriced_count}
              unit="listings"
              icon={<ShieldX className="h-4 w-4" />}
              tone={data.overpriced_count > 0 ? "violation" : "neutral"}
              delay={0.04}
            />
            <StatTile
              label="Cross-portal"
              value={data.cross_portal_matches}
              unit="matches"
              icon={<GitCompareArrows className="h-4 w-4" />}
              tone={data.cross_portal_matches > 0 ? "drift" : "neutral"}
              delay={0.08}
            />
            <StatTile
              label="Portals"
              value={data.portals}
              unit="connected"
              icon={<Globe2 className="h-4 w-4" />}
              delay={0.12}
            />
            <StatTile
              label="Price changes"
              value={data.price_changes_24h}
              unit="24h"
              icon={<TrendingUp className="h-4 w-4" />}
              delay={0.16}
            />
            <StatTile
              label="Newly delisted"
              value={data.newly_delisted_24h}
              unit="24h"
              icon={<PackageX className="h-4 w-4" />}
              tone={data.newly_delisted_24h > 0 ? "drift" : "neutral"}
              className="lg:col-span-2"
              hint="A listing vanishing between runs is the only sold signal a portal gives."
              delay={0.2}
            />
          </div>
        )}
      </QueryState>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          index="02"
          title="Notable market-value calls"
          href="/market-value"
          delay={0.05}
          bodyClassName="px-5 py-0"
        >
          <QueryState
            isLoading={marketValue.isLoading}
            error={marketValue.error}
            data={notableDeals}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No good-deal or overpriced calls right now"
            emptyDescription="Every active listing with enough comparables is currently priced fairly."
            skeleton={<div className="py-4"><ListRowSkeleton rows={5} /></div>}
          >
            {(rows) => (
              <ul>
                {rows.slice(0, 5).map((r) => (
                  <PanelRow key={r.listing_id}>
                    <div className="min-w-0">
                      <Link
                        to={`/listings/${r.listing_id}`}
                        className="block truncate text-[13.5px] tracking-[-0.01em] text-label-1 transition-colors duration-200 hover:text-brand"
                      >
                        {r.title}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-label-3">
                        <span className="text-label-2 tabular-nums">{formatCurrency(r.current_price)}</span>
                        {r.segment_median && (
                          <span className="tabular-nums">· median {formatCurrency(r.segment_median)}</span>
                        )}
                        {r.is_seeded && <SeededBadge isSeeded />}
                      </div>
                    </div>
                    <SeverityBadge verdict={r.verdict} />
                  </PanelRow>
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>

        <Panel
          index="03"
          title="Cross-portal matches"
          href="/cross-portal"
          delay={0.1}
          bodyClassName="px-5 py-0"
        >
          <QueryState
            isLoading={crossPortal.isLoading}
            error={crossPortal.error}
            data={crossPortal.data}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No cross-portal duplicates found yet"
            emptyDescription="No listing has been matched to the same car on a different portal."
            skeleton={<div className="py-4"><ListRowSkeleton rows={5} /></div>}
          >
            {(rows) => (
              <ul>
                {rows.slice(0, 5).map((r) => (
                  <PanelRow key={r.listing_id}>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] tracking-[-0.01em] text-label-1">
                        {r.listing_title}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-label-3">
                        <span className="tabular-nums">
                          {r.portal_name} {formatCurrency(r.current_price)}
                        </span>
                        <span className="text-label-4">vs</span>
                        <span className="tabular-nums">
                          {r.matched_portal_name} {formatCurrency(r.matched_price)}
                        </span>
                        {r.is_seeded && <SeededBadge isSeeded />}
                      </div>
                    </div>
                    <span className="shrink-0 bg-severity-drift/10 px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-severity-drift tabular-nums uppercase">
                      {r.pct_price_gap}% gap
                    </span>
                  </PanelRow>
                ))}
              </ul>
            )}
          </QueryState>
        </Panel>
      </div>

      <Panel index="04" title="Recent activity" delay={0.15} bodyClassName="px-5 py-0">
        <QueryState
          isLoading={delistings.isLoading}
          error={delistings.error}
          data={delistings.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No delisting events yet"
          skeleton={<div className="py-4"><ListRowSkeleton rows={8} /></div>}
        >
          {(rows) => (
            <ul>
              {rows.slice(0, 8).map((r) => (
                <PanelRow key={r.listing_id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-1.5 w-1.5 shrink-0 bg-severity-drift shadow-[0_0_8px_1px] shadow-severity-drift/50" />
                    <span className="truncate text-[13.5px] tracking-[-0.01em] text-label-1">
                      {r.title}
                    </span>
                    <span className="hidden shrink-0 font-mono text-[11px] text-label-3 sm:inline">
                      delisted at {r.portal_name} after {secondsToDays(r.days_on_market_seconds)}d
                    </span>
                    {r.is_seeded && <SeededBadge isSeeded />}
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-label-3 tabular-nums">
                    {timeAgo(r.delisted_at)}
                  </span>
                </PanelRow>
              ))}
            </ul>
          )}
        </QueryState>
      </Panel>
    </div>
  );
}
