import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState, TableSkeleton } from "@/components/domain/QueryState";
import { PageHeader } from "@/components/domain/PageHeader";
import { Panel } from "@/components/domain/Panel";
import { RefreshCw } from "lucide-react";

export function CatalogManagement() {
  const portals = useQuery({ queryKey: ["portals"], queryFn: api.portals });
  const listings = useQuery({ queryKey: ["listings"], queryFn: api.listings });
  const queryClient = useQueryClient();
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const trigger = useMutation({
    mutationFn: (portalId: number) => api.triggerCollection(portalId),
    onSuccess: () => {
      setTriggerError(null);
      queryClient.invalidateQueries({ queryKey: ["portals"] });
    },
    onError: (err) => setTriggerError(err instanceof Error ? err.message : "Trigger failed"),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuration"
        index="07"
        title="Catalog Management"
        description="Portals and tracked listings driving the pipeline. Every scrape goes through Bright Data Scraper Studio — this page shows the collector each portal is wired to and lets you fire a manual collection."
      />

      {triggerError && (
        <div
          className="rounded-lg bg-severity-violation/[0.07] px-4 py-3 font-mono text-[11.5px] leading-relaxed text-severity-violation"
          style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--severity-violation) 30%, transparent)" }}
        >
          {triggerError} — check BRIGHT_DATA_API_TOKEN is set in backend/.env.
        </div>
      )}

      <Panel
        index="01"
        title="Portals"
        meta={portals.data ? `${portals.data.length} connected` : undefined}
        bodyClassName="px-0 py-0"
      >
        <QueryState
          isLoading={portals.isLoading}
          error={portals.error}
          data={portals.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No portals configured"
          skeleton={<div className="p-5"><TableSkeleton rows={3} cols={5} /></div>}
        >
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr>
                    {["Portal", "Collector ID", "Listings tracked", "Last collection", ""].map((h, i) => (
                      <th key={i} className="label-mono px-5 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="[&>td]:border-t [&>td]:border-[var(--hairline)] transition-colors duration-200 hover:bg-surface-2">
                      <td className="px-5 py-4">
                        <div className="text-[13.5px] tracking-[-0.01em] text-label-1">{p.name}</div>
                        <a
                          href={p.base_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block font-mono text-[10.5px] text-label-3 transition-colors duration-200 hover:text-brand"
                        >
                          {p.base_url}
                        </a>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-label-3">{p.collector_id}</td>
                      <td className="px-5 py-4 font-mono text-[12px] tabular-nums text-label-2">
                        {p.tracked_listings}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] tabular-nums text-label-3">
                        {p.last_collection_at ? new Date(p.last_collection_at).toLocaleString() : "Never"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          disabled={trigger.isPending}
                          onClick={() => trigger.mutate(p.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-label-2 uppercase shadow-[inset_0_0_0_1px_var(--hairline-strong)] transition-colors duration-200 hover:bg-surface-3 hover:text-label-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3 w-3 ${trigger.isPending ? "animate-spin" : ""}`} />
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryState>
      </Panel>

      <Panel
        index="02"
        title="Tracked listings"
        meta={listings.data ? `${listings.data.length} listings` : undefined}
        delay={0.05}
        bodyClassName="px-0 py-0"
      >
        <QueryState
          isLoading={listings.isLoading}
          error={listings.error}
          data={listings.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No listings tracked yet"
          skeleton={<div className="p-5"><TableSkeleton rows={6} cols={4} /></div>}
        >
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr>
                    {["Title", "Portal", "City", "Needs review"].map((h) => (
                      <th key={h} className="label-mono px-5 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr
                      key={l.listing_id}
                      className="[&>td]:border-t [&>td]:border-[var(--hairline)] transition-colors duration-200 hover:bg-surface-2"
                    >
                      <td className="px-5 py-3 text-[13px] tracking-[-0.01em] text-label-1">{l.title}</td>
                      <td className="px-5 py-3 font-mono text-[11px] text-label-3">{l.portal_name}</td>
                      <td className="px-5 py-3 font-mono text-[11px] text-label-3">{l.city || "—"}</td>
                      <td className="px-5 py-3">
                        {l.needs_review ? (
                          <span className="bg-severity-drift/10 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-severity-drift uppercase">
                            Low confidence
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-label-4">—</span>
                        )}
                      </td>
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
