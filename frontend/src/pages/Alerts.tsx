import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { PageHeader } from "@/components/domain/PageHeader";
import { Panel, PanelRow } from "@/components/domain/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

const RULE_TYPES = [
  { value: "price_below", label: "Price drops below" },
  { value: "price_drop_pct", label: "Price drops more than %" },
  { value: "below_market_value", label: "Priced below market by %" },
  { value: "sold", label: "Sold / delisted" },
];

/** The field treatment shared by both selects and the threshold input. */
const FIELD_CLASS =
  "h-10 rounded-lg bg-surface-3 px-3 font-mono text-[12px] text-label-1 shadow-[inset_0_0_0_1px_var(--hairline-strong)] transition-colors duration-200 hover:bg-surface-2 focus:outline-none focus:shadow-[inset_0_0_0_1px_var(--electric)]";

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

  const needsThreshold =
    ruleType === "price_below" || ruleType === "price_drop_pct" || ruleType === "below_market_value";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Monitoring"
        index="05"
        title="Alerts"
        description="In-app delivery. Rule evaluation runs against the append-only listing_snapshots history, same as every other feature."
      />

      <Panel index="01" title="New alert rule">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-2">
            <span className="label-mono">Listing</span>
            <select
              className={FIELD_CLASS}
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

          <label className="flex flex-col gap-2">
            <span className="label-mono">Rule</span>
            <select
              className={FIELD_CLASS}
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
            <label className="flex flex-col gap-2">
              <span className="label-mono">Threshold</span>
              <Input
                className={`${FIELD_CLASS} w-32`}
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={ruleType === "price_below" ? "₹" : "%"}
              />
            </label>
          )}

          <Button
            variant="acid"
            size="lg"
            className="h-10 px-4 font-mono text-[11px] tracking-[0.16em] uppercase"
            disabled={!listingId || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Creating…" : "Create alert"}
          </Button>
        </div>

        {create.isError && (
          <p className="mt-4 font-mono text-[11px] text-severity-violation">
            Could not create the rule:{" "}
            {create.error instanceof Error ? create.error.message : "unknown error"}
          </p>
        )}
      </Panel>

      <Panel
        index="02"
        title="Active rules"
        meta={alerts.data ? `${alerts.data.filter((a) => a.is_active).length} active` : undefined}
        delay={0.05}
        bodyClassName="px-5 py-0"
      >
        <QueryState
          isLoading={alerts.isLoading}
          error={alerts.error}
          data={alerts.data}
          isEmpty={(d) => d.filter((a) => a.is_active).length === 0}
          emptyTitle="No alert rules yet"
          emptyDescription="Create one above — it'll evaluate against every new snapshot."
        >
          {(rows) => (
            <ul>
              {rows
                .filter((a) => a.is_active)
                .map((a) => (
                  <PanelRow key={a.id}>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] tracking-[-0.01em] text-label-1">
                        {a.title}
                      </div>
                      <div className="label-mono mt-1.5">
                        {RULE_TYPES.find((r) => r.value === a.rule_type)?.label ?? a.rule_type}
                        {a.threshold != null ? ` ${a.threshold}` : ""}
                        <span className="text-label-4"> / {a.portal_name}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="font-mono text-[11px] tabular-nums text-label-3">
                        {a.fired_count}× fired
                      </span>
                      <button
                        aria-label={`Delete alert for ${a.title}`}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(a.id)}
                        className="rounded-lg p-1.5 text-label-4 transition-colors duration-200 hover:bg-severity-violation/10 hover:text-severity-violation disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </PanelRow>
                ))}
            </ul>
          )}
        </QueryState>
      </Panel>
    </div>
  );
}
