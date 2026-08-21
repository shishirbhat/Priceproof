import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { QueryState, ListRowSkeleton } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { PageHeader } from "@/components/domain/PageHeader";
import { DUR, EASE_EXPO, REVEAL_VIEWPORT } from "@/lib/motion";
import { ArrowRight } from "lucide-react";

export function CrossPortal() {
  const matches = useQuery({ queryKey: ["cross-portal"], queryFn: api.crossPortalMatches });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Duplicate detection"
        index="03"
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
              <motion.article
                key={r.listing_id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: DUR.base, delay: i * 0.05, ease: EASE_EXPO }}
                className="panel rounded-sm"
              >
                <header className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="index-numeral text-label-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-[13.5px] tracking-[-0.01em] text-label-1">
                      {r.listing_title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {r.needs_review && (
                      <span className="bg-severity-drift/10 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-severity-drift uppercase">
                        Fuzzy · needs review
                      </span>
                    )}
                    {r.is_seeded && <SeededBadge isSeeded />}
                  </div>
                  <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--hairline)]" />
                </header>

                {/* The comparison plate. Both sides get equal weight and the
                    gap sits between them, because the gap is the finding. */}
                <div className="flex flex-wrap items-center gap-4 px-5 py-5 sm:flex-nowrap">
                  <a
                    href={r.listing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group min-w-0 flex-1"
                  >
                    <div className="label-mono transition-colors duration-200 group-hover:text-label-2">
                      {r.portal_name}
                    </div>
                    <div className="mt-2 font-mono text-[1.4rem] leading-none tabular-nums text-label-1 transition-colors duration-200 group-hover:text-brand">
                      {formatCurrency(r.current_price)}
                    </div>
                  </a>

                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-label-4 sm:block" />

                  <a
                    href={r.matched_listing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group min-w-0 flex-1 sm:text-right"
                  >
                    <div className="label-mono transition-colors duration-200 group-hover:text-label-2">
                      {r.matched_portal_name}
                    </div>
                    <div className="mt-2 font-mono text-[1.4rem] leading-none tabular-nums text-label-1 transition-colors duration-200 group-hover:text-brand">
                      {formatCurrency(r.matched_price)}
                    </div>
                  </a>

                  <span className="shrink-0 bg-severity-drift/10 px-3 py-2 font-mono text-[12px] tabular-nums text-severity-drift">
                    {r.pct_price_gap}% gap
                  </span>
                </div>

                {r.match_confidence && (
                  <div className="rule-t label-mono px-5 py-3">
                    Match confidence {Math.round(Number(r.match_confidence) * 100)}%
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
