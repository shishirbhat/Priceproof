import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { PageHeader } from "@/components/domain/PageHeader";
import { FadeIn } from "@/components/domain/FadeIn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

const RULE_TYPES = [
  { value: "price_below", label: "Price drops below" },
  { value: "price_drop_pct", label: "Price drops more than %" },
  { value: "below_market_value", label: "Priced below market by %" },
  { value: "sold", label: "Sold / delisted" },
];

export function Alerts() {
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: api.alerts });
  const listings = useQuery({ queryKey: ["listings"], queryFn: api.listings });
  const queryClient = useQueryClient();

  const [listingId, setListingId] = useState("");
  const [ruleType, setRuleType] = useState(RULE_TYPES[0].value);
  const [threshold, setThreshold] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.createAlert({
        listing_id: Number(listingId),
        rule_type: ruleType,
        threshold: threshold ? Number(threshold) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setThreshold("");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.deleteAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const needsThreshold = ruleType === "price_below" || ruleType === "price_drop_pct" || ruleType === "below_market_value";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// 06 ALERTS"
        title="Alerts"
        description="In-app delivery. Rule evaluation runs against the append-only listing_snapshots history, same as every other feature."
      />

      <FadeIn>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">New alert rule</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Listing
            <select
              className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm transition-colors hover:bg-white/[0.05] focus:border-white/20 focus:outline-none"
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
            >
              <option value="">Select…</option>
              {listings.data?.map((l) => (
                <option key={l.listing_id} value={l.listing_id}>
                  {l.title} — {l.portal_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Rule
            <select
              className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm transition-colors hover:bg-white/[0.05] focus:border-white/20 focus:outline-none"
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
            >
              {RULE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          {needsThreshold && (
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Threshold
              <Input
                className="h-9 w-28"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={ruleType === "price_below" ? "₹" : "%"}
              />
            </label>
          )}
          <Button
            size="sm"
            disabled={!listingId || create.isPending}
            onClick={() => create.mutate()}
          >
            Create alert
          </Button>
        </div>
      </Card>
      </FadeIn>

      <FadeIn delay={0.05}>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">Active rules</h2>
        <QueryState
          isLoading={alerts.isLoading}
          error={alerts.error}
          data={alerts.data}
          isEmpty={(d) => d.filter((a) => a.is_active).length === 0}
          emptyTitle="No alert rules yet"
          emptyDescription="Create one above — it'll evaluate against every new snapshot."
        >
          {(rows) => (
            <ul className="divide-y divide-white/[0.05]">
              {rows
                .filter((a) => a.is_active)
                .map((a) => (
                  <li
                    key={a.id}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
                  >
                    <div>
                      <span className="font-medium">{a.title}</span>{" "}
                      <span className="text-muted-foreground">
                        · {RULE_TYPES.find((r) => r.value === a.rule_type)?.label ?? a.rule_type}
                        {a.threshold != null ? ` ${a.threshold}` : ""} · {a.portal_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        fired {a.fired_count}×
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete alert for ${a.title}`}
                        onClick={() => remove.mutate(a.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
