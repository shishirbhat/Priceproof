import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState, ListRowSkeleton } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function CrossPortal() {
  const matches = useQuery({ queryKey: ["cross-portal"], queryFn: api.crossPortalMatches });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Duplicate detection"
        title="Cross-Portal Matches"
        description="Listings believed to be the same physical car, cross-posted to two different portals — matched on make, model, year, registration prefix, and city, since no India listings portal publishes a full VIN or plate on its results grid. Dealer-owned stock is excluded by construction: a dealer who bought the car outright can't have a duplicate elsewhere."
      />

      <QueryState
        isLoading={matches.isLoading}
        error={matches.error}
        data={matches.data}
        isEmpty={(d) => d.length === 0}
        emptyTitle="No cross-portal duplicates found yet"
        emptyDescription="No active listing has been matched to the same car on a different portal."
        skeleton={<ListRowSkeleton rows={4} />}
      >
        {(rows) => (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <FadeIn key={r.listing_id} delay={i * 0.05}>
                <Card className="gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{r.listing_title}</div>
                    <div className="flex items-center gap-2">
                      {r.needs_review && (
                        <span className="rounded-full border border-severity-drift/25 bg-severity-drift/10 px-2 py-0.5 text-[11px] font-medium text-severity-drift">
                          fuzzy match, needs review
                        </span>
                      )}
                      {r.is_seeded && <SeededBadge isSeeded />}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-black/20 p-4">
                    <a
                      href={r.listing_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 transition-colors hover:text-foreground/80"
                    >
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.portal_name}</div>
                      <div className="font-mono text-lg tabular-nums">{formatCurrency(r.current_price)}</div>
                    </a>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={r.matched_listing_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-right transition-colors hover:text-foreground/80"
                    >
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.matched_portal_name}</div>
                      <div className="font-mono text-lg tabular-nums">{formatCurrency(r.matched_price)}</div>
                    </a>
                    <span className="shrink-0 rounded-full border border-severity-drift/25 bg-severity-drift/10 px-2.5 py-1 text-xs font-medium text-severity-drift">
                      {r.pct_price_gap}% gap
                    </span>
                  </div>
                  {r.match_confidence && (
                    <div className="text-[11px] text-muted-foreground">
                      Match confidence: {Math.round(Number(r.match_confidence) * 100)}%
                    </div>
                  )}
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
