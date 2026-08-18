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
  { value: "back_in_stock", label: "Back in stock" },
  { value: "map_breach", label: "MAP breach" },
  { value: "integrity_failure", label: "Discount-integrity failure" },
];

export function Alerts() {
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: api.alerts });
  const products = useQuery({ queryKey: ["products"], queryFn: api.products });
  const queryClient = useQueryClient();

  const [storeProductId, setStoreProductId] = useState("");
  const [ruleType, setRuleType] = useState(RULE_TYPES[0].value);
  const [threshold, setThreshold] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.createAlert({
        store_product_id: Number(storeProductId),
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

  const needsThreshold = ruleType === "price_below" || ruleType === "price_drop_pct";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// 06 ALERTS"
        title="Alerts"
        description="In-app delivery. Rule evaluation runs against the append-only snapshot history, same as every other feature."
      />

      <FadeIn>
      <Card className="gap-3 p-5">
        <h2 className="text-[13px] font-semibold tracking-tight">New alert rule</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Product
            <select
              className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm transition-colors hover:bg-white/[0.05] focus:border-white/20 focus:outline-none"
              value={storeProductId}
              onChange={(e) => setStoreProductId(e.target.value)}
            >
              <option value="">Select…</option>
              {products.data?.map((p) => (
                <option key={p.store_product_id} value={p.store_product_id}>
                  {p.title} — {p.store_name}
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
                placeholder={ruleType === "price_below" ? "$" : "%"}
              />
            </label>
          )}
          <Button
            size="sm"
            disabled={!storeProductId || create.isPending}
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
                        {a.threshold != null ? ` ${a.threshold}` : ""} · {a.store_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        fired {a.fired_count}×
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => remove.mutate(a.id)}>
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
