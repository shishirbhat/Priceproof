import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Catalog Management"
        description="Portals and tracked listings driving the pipeline. Every scrape goes through Bright Data Scraper Studio — this page shows the collector each portal is wired to and lets you fire a manual collection."
      />

      {triggerError && (
        <div className="rounded-lg border border-severity-violation/25 bg-severity-violation/10 px-3 py-2 text-xs text-severity-violation">
          {triggerError} — check BRIGHT_DATA_API_TOKEN is set in backend/.env.
        </div>
      )}

      <FadeIn>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">Portals</h2>
        <QueryState
          isLoading={portals.isLoading}
          error={portals.error}
          data={portals.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No portals configured"
        >
          {(rows) => (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.06] text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Portal</th>
                  <th className="py-2 pr-4 font-medium">Collector ID</th>
                  <th className="py-2 pr-4 font-medium">Listings tracked</th>
                  <th className="py-2 pr-4 font-medium">Last collection</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="py-2 pr-4">
                      <div className="font-medium">{p.name}</div>
                      <a
                        href={p.base_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {p.base_url}
                      </a>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{p.collector_id}</td>
                    <td className="py-2 pr-4 tabular-nums">{p.tracked_listings}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">
                      {p.last_collection_at ? new Date(p.last_collection_at).toLocaleString() : "Never"}
                    </td>
                    <td className="py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={trigger.isPending}
                        onClick={() => trigger.mutate(p.id)}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${trigger.isPending ? "animate-spin" : ""}`} />
                        Trigger collection
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </QueryState>
      </Card>
      </FadeIn>

      <FadeIn delay={0.05}>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">Tracked listings</h2>
        <QueryState
          isLoading={listings.isLoading}
          error={listings.error}
          data={listings.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No listings tracked yet"
        >
          {(rows) => (
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-4 font-medium">Title</th>
                  <th className="py-1.5 pr-4 font-medium">Portal</th>
                  <th className="py-1.5 pr-4 font-medium">City</th>
                  <th className="py-1.5 font-medium">Needs review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.listing_id} className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.02]">
                    <td className="py-1.5 pr-4">{l.title}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">{l.portal_name}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">{l.city || "—"}</td>
                    <td className="py-1.5">
                      {l.needs_review ? (
                        <span className="text-severity-drift">low-confidence match</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </QueryState>
      </Card>
      </FadeIn>
    </div>
  );
}
