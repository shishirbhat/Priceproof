import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { QueryState, TableSkeleton } from "@/components/domain/QueryState";
import { PageHeader } from "@/components/domain/PageHeader";
import { Panel } from "@/components/domain/Panel";
import { StatTile } from "@/components/domain/StatTile";
import { AnimatedBar } from "@/components/domain/AnimatedBar";
import { DUR, EASE_EXPO } from "@/lib/motion";
import { Gauge } from "@/components/charts/gauge";
import { Layers, ListTree } from "lucide-react";

// Bright Data free tier ceiling stated for this hackathon: ~5K page loads.
const PAGE_LOAD_BUDGET = 5000;

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}m`;
}

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-severity-genuine/10 text-severity-genuine",
  building: "bg-severity-drift/10 text-severity-drift",
  pending: "bg-surface-3 text-label-3",
  failed: "bg-severity-violation/10 text-severity-violation",
};

export function ScraperHealth() {
  const collections = useQuery({ queryKey: ["collections"], queryFn: api.collections });
  const coverage = useQuery({ queryKey: ["field-coverage"], queryFn: api.fieldCoverage });

  const totalPageLoads = useMemo(
    () => (collections.data ?? []).reduce((sum, c) => sum + (c.page_loads_used ?? 0), 0),
    [collections.data],
  );

  const latestCoverageByField = useMemo(() => {
    if (!coverage.data || coverage.data.length === 0) return [];
    const byField = new Map<string, (typeof coverage.data)[number]>();
    for (const row of coverage.data) {
      const existing = byField.get(row.field_name);
      if (!existing || new Date(row.triggered_at) > new Date(existing.triggered_at)) {
        byField.set(row.field_name, row);
      }
    }
    return Array.from(byField.values()).sort((a, b) => a.field_name.localeCompare(b.field_name));
  }, [coverage.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Collection health"
        index="06"
        title="Scraper Health"
        description="Every Bright Data Scraper Studio run, its field coverage over time, and the credit/page-load budget — the evidence that the platform is doing real work, including recovering when a target site changes under it."
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-[var(--hairline)] lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE_EXPO }}
          className="relative flex flex-col items-center gap-3 overflow-hidden bg-surface-1 p-5"
        >
          <span className="label-mono self-start">Page-load budget</span>
          <Gauge
            orientation="arc"
            value={Math.min(100, (totalPageLoads / PAGE_LOAD_BUDGET) * 100)}
            centerValue={totalPageLoads}
            defaultLabel={`of ${PAGE_LOAD_BUDGET.toLocaleString()} loads`}
            width={180}
            height={120}
          />
          {/* The live-instrument cue: a scan travelling the plate. */}
          <span className="scan-line pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-electric/[0.07] to-transparent" />
        </motion.div>

        <StatTile
          index="01"
          label="Collections run"
          value={collections.data?.length ?? "—"}
          icon={<Layers className="h-3.5 w-3.5" />}
          className="rounded-none shadow-none"
          delay={0.05}
        />
        <StatTile
          index="02"
          label="Fields tracked"
          value={latestCoverageByField.length || "—"}
          icon={<ListTree className="h-3.5 w-3.5" />}
          className="rounded-none shadow-none"
          delay={0.1}
        />
      </div>

      <Panel index="03" title="Field coverage — most recent run">
        <QueryState
          isLoading={coverage.isLoading}
          error={coverage.error}
          data={latestCoverageByField}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No collections have run yet"
          emptyDescription='Trigger one with `npm run collect` in backend/ once BRIGHT_DATA_API_TOKEN is set — this page fills in from real Scraper Studio output.'
          skeleton={<TableSkeleton rows={5} cols={3} />}
        >
          {(rows) => (
            <ul className="space-y-3">
              {rows.map((r, i) => {
                const pct = r.total_count > 0 ? Math.round((r.present_count / r.total_count) * 100) : 0;
                const degraded = pct < 100;
                return (
                  <li key={r.field_name} className="flex items-center gap-4">
                    <span className="w-44 shrink-0 truncate font-mono text-[11px] text-label-2">
                      {r.field_name}
                    </span>
                    <AnimatedBar
                      pct={pct}
                      delay={i * 40}
                      className={degraded ? "bg-severity-drift" : "bg-severity-genuine"}
                    />
                    <span className="w-20 shrink-0 text-right font-mono text-[11px] tabular-nums text-label-3">
                      {r.present_count}/{r.total_count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </QueryState>
      </Panel>

      <Panel
        index="04"
        title="Collection runs"
        meta={collections.data ? `${collections.data.length} runs` : undefined}
        delay={0.05}
        bodyClassName="px-0 py-0"
      >
        <QueryState
          isLoading={collections.isLoading}
          error={collections.error}
          data={collections.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No collections have run yet"
          emptyDescription="Every trigger/poll cycle against Bright Data Scraper Studio will appear here with status, duration, and page loads used."
          skeleton={<div className="p-5"><TableSkeleton rows={5} cols={6} /></div>}
        >
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr>
                    {["Portal", "Triggered", "Status", "Duration", "Records", "Page loads"].map((h) => (
                      <th key={h} className="label-mono px-5 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className="[&>td]:border-t [&>td]:border-[var(--hairline)] font-mono text-[11.5px] transition-colors duration-200 hover:bg-surface-2"
                    >
                      <td className="px-5 py-3 text-label-1">{c.portal_name}</td>
                      <td className="px-5 py-3 text-label-3 tabular-nums">
                        {new Date(c.triggered_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-1 text-[9px] tracking-[0.2em] uppercase ${STATUS_STYLES[c.status] ?? "bg-surface-3 text-label-3"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 tabular-nums text-label-2">
                        {formatDuration(c.duration_seconds)}
                      </td>
                      <td className="px-5 py-3 tabular-nums text-label-2">{c.record_count ?? "—"}</td>
                      <td className="px-5 py-3 tabular-nums text-label-2">{c.page_loads_used ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryState>
      </Panel>
    </div>
  );
}
