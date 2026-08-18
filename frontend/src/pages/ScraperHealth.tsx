import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { Card } from "@/components/ui/card";
import { Gauge } from "@/components/charts/gauge";

// Bright Data free tier ceiling stated for this hackathon: ~5K page loads.
const PAGE_LOAD_BUDGET = 5000;

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}m`;
}

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-severity-genuine/15 text-severity-genuine border-severity-genuine/30",
  building: "bg-severity-drift/15 text-severity-drift border-severity-drift/30",
  pending: "bg-muted text-muted-foreground border-border",
  failed: "bg-severity-violation/15 text-severity-violation border-severity-violation/30",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Scraper Health</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every Bright Data Scraper Studio run, its field coverage over time, and the credit/page-load
          budget — the evidence that the platform is doing real work, including recovering when a
          target site changes under it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="items-center gap-2 p-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Page-load budget
          </span>
          <Gauge
            orientation="arc"
            value={Math.min(100, (totalPageLoads / PAGE_LOAD_BUDGET) * 100)}
            centerValue={totalPageLoads}
            defaultLabel={`of ${PAGE_LOAD_BUDGET.toLocaleString()} loads`}
            width={180}
            height={120}
          />
        </Card>
        <Card className="justify-center gap-1 p-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Collections run
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums">
            {collections.data?.length ?? "—"}
          </span>
        </Card>
        <Card className="justify-center gap-1 p-5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fields tracked
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums">
            {latestCoverageByField.length || "—"}
          </span>
        </Card>
      </div>

      <Card className="gap-3 p-5">
        <h2 className="text-sm font-medium">Field coverage — most recent run</h2>
        <QueryState
          isLoading={coverage.isLoading}
          error={coverage.error}
          data={latestCoverageByField}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No collections have run yet"
          emptyDescription='Trigger one with `npm run collect` in backend/ once BRIGHT_DATA_API_TOKEN is set — this page fills in from real Scraper Studio output.'
        >
          {(rows) => (
            <ul className="space-y-2">
              {rows.map((r) => {
                const pct = r.total_count > 0 ? Math.round((r.present_count / r.total_count) * 100) : 0;
                const degraded = pct < 100;
                return (
                  <li key={r.field_name} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate font-mono text-xs">{r.field_name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={degraded ? "h-full bg-severity-drift" : "h-full bg-severity-genuine"}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {r.present_count}/{r.total_count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </QueryState>
      </Card>

      <Card className="gap-3 p-5">
        <h2 className="text-sm font-medium">Collection runs</h2>
        <QueryState
          isLoading={collections.isLoading}
          error={collections.error}
          data={collections.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No collections have run yet"
          emptyDescription="Every trigger/poll cycle against Bright Data Scraper Studio will appear here with status, duration, and page loads used."
        >
          {(rows) => (
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-4 font-medium">Store</th>
                  <th className="py-1.5 pr-4 font-medium">Triggered</th>
                  <th className="py-1.5 pr-4 font-medium">Status</th>
                  <th className="py-1.5 pr-4 font-medium">Duration</th>
                  <th className="py-1.5 pr-4 font-medium">Records</th>
                  <th className="py-1.5 font-medium">Page loads</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {rows.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="py-1.5 pr-4">{c.store_name}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">
                      {new Date(c.triggered_at).toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-4">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLES[c.status] ?? ""}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-1.5 pr-4 tabular-nums">{formatDuration(c.duration_seconds)}</td>
                    <td className="py-1.5 pr-4 tabular-nums">{c.record_count ?? "—"}</td>
                    <td className="py-1.5 tabular-nums">{c.page_loads_used ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </QueryState>
      </Card>
    </div>
  );
}
