import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function CatalogManagement() {
  const stores = useQuery({ queryKey: ["stores"], queryFn: api.stores });
  const products = useQuery({ queryKey: ["products"], queryFn: api.products });
  const queryClient = useQueryClient();
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const trigger = useMutation({
    mutationFn: (storeId: number) => api.triggerCollection(storeId),
    onSuccess: () => {
      setTriggerError(null);
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (err) => setTriggerError(err instanceof Error ? err.message : "Trigger failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Catalog Management</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Stores and tracked products driving the pipeline. Every scrape goes through Bright Data
          Scraper Studio — this page shows the collector each store is wired to and lets you fire a
          manual collection.
        </p>
      </div>

      {triggerError && (
        <div className="rounded-lg border border-severity-violation/30 bg-severity-violation/10 px-3 py-2 text-xs text-severity-violation">
          {triggerError} — check BRIGHT_DATA_API_TOKEN is set in backend/.env.
        </div>
      )}

      <Card className="gap-3 p-5">
        <h2 className="text-sm font-medium">Stores</h2>
        <QueryState
          isLoading={stores.isLoading}
          error={stores.error}
          data={stores.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No stores configured"
        >
          {(rows) => (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Store</th>
                  <th className="py-2 pr-4 font-medium">Collector ID</th>
                  <th className="py-2 pr-4 font-medium">Products tracked</th>
                  <th className="py-2 pr-4 font-medium">Last collection</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4">
                      <div className="font-medium">{s.name}</div>
                      <a
                        href={s.base_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {s.base_url}
                      </a>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{s.collector_id}</td>
                    <td className="py-2 pr-4 tabular-nums">{s.tracked_products}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">
                      {s.last_collection_at ? new Date(s.last_collection_at).toLocaleString() : "Never"}
                    </td>
                    <td className="py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={trigger.isPending}
                        onClick={() => trigger.mutate(s.id)}
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

      <Card className="gap-3 p-5">
        <h2 className="text-sm font-medium">Tracked products</h2>
        <QueryState
          isLoading={products.isLoading}
          error={products.error}
          data={products.data}
          isEmpty={(d) => d.length === 0}
          emptyTitle="No products tracked yet"
        >
          {(rows) => (
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-4 font-medium">Title</th>
                  <th className="py-1.5 pr-4 font-medium">Store</th>
                  <th className="py-1.5 pr-4 font-medium">Region</th>
                  <th className="py-1.5 font-medium">Needs review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.store_product_id} className="border-t border-border">
                    <td className="py-1.5 pr-4">{p.title}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">{p.store_name}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">{p.region_code || "—"}</td>
                    <td className="py-1.5">
                      {p.needs_review ? (
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
    </div>
  );
}
